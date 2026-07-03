import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALIDATION_LIMITS } from '../config.js';
import { validateString, validateNumber, validateDate, validationError, parsePositiveId, logActivity } from '../validation.js';
import { notifyChange } from '../events.js';

const router = Router();

router.get('/api/custody', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.custody.defaultLimit, 1), PAGINATION.custody.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const { search, status: statusFilter, dateFrom, dateTo } = req.query;
    const filters = [];
    if (search) filters.push(sql`(item ILIKE ${'%' + search + '%'} OR holder ILIKE ${'%' + search + '%'} OR department ILIKE ${'%' + search + '%'})`);
    if (statusFilter && ['active', 'returned'].includes(statusFilter)) {
      filters.push(sql`status = ${statusFilter}`);
    }
    if (dateFrom) filters.push(sql`checkout >= ${dateFrom}`);
    if (dateTo) filters.push(sql`checkout <= ${dateTo}`);
    const where = filters.length ? sql`WHERE ${filters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const countResult = await sql`SELECT COUNT(*) as count FROM custody ${where}`;
    const total = Number(countResult[0].count);
    const records = await sql`SELECT * FROM custody ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const statsRow = (await sql`SELECT COUNT(*) AS active_count, COALESCE(SUM(value), 0) AS active_value FROM custody WHERE status = 'active'`)[0];
    const stats = { activeCount: Number(statsRow.active_count), activeValue: Number(statsRow.active_value) };
    res.json({ data: records, total, limit, offset, hasMore: offset + limit < total, stats });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/custody', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { inventoryId, holder, department, checkout, expected, notes } = req.body;
    let err;
    if ((err = validateNumber(inventoryId, 1))) return validationError(res, 'inventoryId', err);
    if ((err = validateString(holder))) return validationError(res, 'holder', err);
    if ((err = validateString(department))) return validationError(res, 'department', err);
    if ((err = validateDate(checkout))) return validationError(res, 'checkout', err);
    if ((err = validateDate(expected))) return validationError(res, 'expected', err);
    if (notes && notes.length > VALIDATION_LIMITS.string.notesMax) return validationError(res, 'notes', `Máximo de ${VALIDATION_LIMITS.string.notesMax} caracteres`);
    if (expected < checkout) return validationError(res, 'expected', 'Previsão de devolução deve ser igual ou posterior à data da retirada');
    const result = await sql.begin(async (trx) => {
      const inv = await trx`SELECT * FROM inventory WHERE id = ${inventoryId} FOR UPDATE`;
      if (!inv.length) return { status: 404 };
      const item = inv[0];
      const active = await trx`SELECT id FROM custody WHERE inventory_id = ${item.id} AND status = 'active' LIMIT 1`;
      if (active.length) return { status: 409 };
      const records = await trx`
        INSERT INTO custody (inventory_id, item, code, holder, department, checkout, expected, value, notes, status)
        VALUES (${item.id}, ${item.name}, ${item.code}, ${holder}, ${department}, ${checkout}, ${expected}, ${item.value}, ${notes || ''}, 'active')
        RETURNING *
      `;
      await trx`UPDATE inventory SET location = 'Em posse', updated_at = NOW() WHERE id = ${item.id}`;
      return { status: 201, record: records[0], item };
    });

    if (result.status === 404) return res.status(404).json({ error: 'Item não encontrado' });
    if (result.status === 409) return res.status(409).json({ error: 'Este item já possui um termo de posse ativo. Registre a devolução antes de uma nova retirada.' });

    await logActivity('Retirada registrada', `${result.item.name} entregue para ${holder}`, req);
    notifyChange('custody', 'created', { id: result.record.id });
    res.status(201).json(result.record);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/custody/:id/return', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const now = new Date().toISOString().slice(0, 10);
    const records = await sql`UPDATE custody SET status = 'returned', returned = ${now}, updated_at = NOW() WHERE id = ${id} AND status = 'active' RETURNING *`;
    if (!records.length) return res.status(404).json({ error: 'Termo não encontrado ou já devolvido' });
    const record = records[0];
    await sql`UPDATE inventory SET location = 'Armário de equipamentos', updated_at = NOW() WHERE id = ${record.inventory_id}`;
    await logActivity('Equipamento devolvido', `${record.item} devolvido por ${record.holder}`, req);
    notifyChange('custody', 'returned', { id: record.id });
    res.json(record);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
