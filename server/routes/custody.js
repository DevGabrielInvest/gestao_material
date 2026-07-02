import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALIDATION_LIMITS } from '../config.js';
import { validateString, validateNumber, validateDate, validationError, logActivity } from '../validation.js';

const router = Router();

router.get('/api/custody', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.custody.defaultLimit, 1), PAGINATION.custody.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM custody`;
    const total = Number(countResult[0].count);
    const records = await sql`SELECT * FROM custody ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: records, total, limit, offset, hasMore: offset + limit < total });
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
    const inv = await sql`SELECT * FROM inventory WHERE id = ${inventoryId}`;
    if (!inv.length) return res.status(404).json({ error: 'Item não encontrado' });
    const item = inv[0];
    const records = await sql`
      INSERT INTO custody (inventory_id, item, code, holder, department, checkout, expected, value, notes, status)
      VALUES (${item.id}, ${item.name}, ${item.code}, ${holder}, ${department}, ${checkout}, ${expected}, ${item.value}, ${notes || ''}, 'active')
      RETURNING *
    `;
    await sql`UPDATE inventory SET location = 'Em posse', updated_at = NOW() WHERE id = ${item.id}`;
    await logActivity('Retirada registrada', `${item.name} entregue para ${holder}`, req);
    res.status(201).json(records[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/custody/:id/return', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString().slice(0, 10);
    const records = await sql`UPDATE custody SET status = 'returned', returned = ${now}, updated_at = NOW() WHERE id = ${id} AND status = 'active' RETURNING *`;
    if (!records.length) return res.status(404).json({ error: 'Termo não encontrado ou já devolvido' });
    const record = records[0];
    await sql`UPDATE inventory SET location = 'Armário de equipamentos', updated_at = NOW() WHERE id = ${record.inventory_id}`;
    await logActivity('Equipamento devolvido', `${record.item} devolvido por ${record.holder}`, req);
    res.json(record);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
