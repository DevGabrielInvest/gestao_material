import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALID_MOVEMENT_TYPES, VALIDATION_LIMITS } from '../config.js';
import { validateNumber, validateEnum, validateDate, validationError, parsePositiveId, logActivity } from '../validation.js';
import { notifyChange } from '../events.js';

const router = Router();
const { maxInteger } = VALIDATION_LIMITS.number;

router.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.movements.defaultLimit, 1), PAGINATION.movements.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const { search, type: typeFilter, dateFrom, dateTo } = req.query;
    const filters = [];
    if (search) filters.push(sql`(item ILIKE ${'%' + search + '%'} OR supplier ILIKE ${'%' + search + '%'} OR document ILIKE ${'%' + search + '%'} OR responsible ILIKE ${'%' + search + '%'})`);
    if (typeFilter && ['entry', 'exit'].includes(typeFilter)) {
      filters.push(sql`type = ${typeFilter}`);
    }
    if (dateFrom) filters.push(sql`date >= ${dateFrom}`);
    if (dateTo) filters.push(sql`date <= ${dateTo}`);
    const where = filters.length ? sql`WHERE ${filters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const countResult = await sql`SELECT COUNT(*) as count FROM movements ${where}`;
    const total = Number(countResult[0].count);
    const movements = await sql`SELECT * FROM movements ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const statsWhere = (() => {
      const fs = [];
      if (typeFilter && ['entry', 'exit'].includes(typeFilter)) fs.push(sql`type = ${typeFilter}`);
      if (dateFrom) fs.push(sql`date >= ${dateFrom}`);
      if (dateTo) fs.push(sql`date <= ${dateTo}`);
      return fs.length ? sql`WHERE ${fs.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    })();
    const statsRow = (await sql`
      SELECT
        COALESCE(SUM(quantity) FILTER (WHERE type = 'entry'), 0) AS entries,
        COALESCE(SUM(quantity) FILTER (WHERE type = 'exit'), 0) AS exits,
        COUNT(DISTINCT supplier) FILTER (WHERE type = 'entry' AND supplier <> '') AS suppliers
      FROM movements ${statsWhere}
    `)[0];
    const stats = { entries: Number(statsRow.entries), exits: Number(statsRow.exits), suppliers: Number(statsRow.suppliers) };
    res.json({ data: movements, total, limit, offset, hasMore: offset + limit < total, stats });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/movements', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { inventoryId, type, quantity, date, supplier, document, notes } = req.body;
    let err;
    if ((err = validateNumber(inventoryId, 1, { integer: true }))) return validationError(res, 'inventoryId', err);
    if ((err = validateEnum(type, VALID_MOVEMENT_TYPES))) return validationError(res, 'type', err);
    if ((err = validateNumber(quantity, 1, { integer: true, max: maxInteger }))) return validationError(res, 'quantity', err);
    if ((err = validateDate(date))) return validationError(res, 'date', err);
    if (supplier && supplier.length > VALIDATION_LIMITS.string.defaultMax) return validationError(res, 'supplier', `Máximo de ${VALIDATION_LIMITS.string.defaultMax} caracteres`);
    if (document && document.length > VALIDATION_LIMITS.string.defaultMax) return validationError(res, 'document', `Máximo de ${VALIDATION_LIMITS.string.defaultMax} caracteres`);
    const result = await sql.begin(async (trx) => {
      const inv = await trx`SELECT * FROM inventory WHERE id = ${inventoryId} FOR UPDATE`;
      if (!inv.length) return { status: 404 };
      const item = inv[0];
      if (type === 'exit' && quantity > item.quantity) return { status: 400, available: item.quantity };
      const operation = type === 'entry' ? trx`+` : trx`-`;
      await trx`UPDATE inventory SET quantity = quantity ${operation} ${quantity}, updated_at = NOW() WHERE id = ${inventoryId}`;
      const movements = await trx`
        INSERT INTO movements (inventory_id, item, code, type, quantity, date, supplier, document, responsible, notes)
        VALUES (${item.id}, ${item.name}, ${item.code}, ${type}, ${quantity}, ${date}, ${supplier || ''}, ${document || ''}, ${req.user.name}, ${notes || ''})
        RETURNING *
      `;
      return { status: 201, movement: movements[0], item };
    });

    if (result.status === 404) return res.status(404).json({ error: 'Item não encontrado' });
    if (result.status === 400) return res.status(400).json({ error: `Saldo insuficiente. Disponível: ${result.available}` });

    await logActivity(type === 'entry' ? 'Entrada de estoque registrada' : 'Saída de estoque registrada', `${result.item.name} · ${quantity} unidade(s) · ${req.user.name}`, req);
    notifyChange('movements', 'created', { id: result.movement.id });
    res.status(201).json(result.movement);
  } catch (err) { handleRouteError(err, req, res); }
});

router.delete('/api/movements/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const result = await sql.begin(async (trx) => {
      const movements = await trx`SELECT * FROM movements WHERE id = ${id} FOR UPDATE`;
      if (!movements.length) return { status: 404 };
      const movement = movements[0];

      if (/^SOL-\d+$/i.test(movement.document || '')) {
        return { status: 409, reason: 'linked_request' };
      }

      const items = await trx`SELECT * FROM inventory WHERE id = ${movement.inventory_id} FOR UPDATE`;
      if (!items.length) return { status: 409, reason: 'missing_inventory' };
      const item = items[0];

      if (movement.type === 'entry' && Number(item.quantity) < Number(movement.quantity)) {
        return { status: 409, reason: 'insufficient_stock' };
      }

      const operation = movement.type === 'entry' ? trx`-` : trx`+`;
      await trx`
        UPDATE inventory
        SET quantity = quantity ${operation} ${movement.quantity}, updated_at = NOW()
        WHERE id = ${movement.inventory_id}
      `;
      const deleted = await trx`DELETE FROM movements WHERE id = ${id} RETURNING *`;
      return { status: 200, movement: deleted[0] };
    });

    if (result.status === 404) return res.status(404).json({ error: 'Movimentação não encontrada' });
    if (result.status === 409 && result.reason === 'linked_request') {
      return res.status(409).json({ error: 'Movimentação vinculada a solicitação entregue não pode ser excluída pelo histórico.' });
    }
    if (result.status === 409 && result.reason === 'missing_inventory') {
      return res.status(409).json({ error: 'Inventário vinculado não encontrado. Exclusão bloqueada para evitar inconsistência de saldo.' });
    }
    if (result.status === 409 && result.reason === 'insufficient_stock') {
      return res.status(409).json({ error: 'Exclusão bloquearia saldo negativo no inventário.' });
    }

    await logActivity('Movimentação removida', `${result.movement.item} · ${result.movement.quantity} unidade(s)`, req);
    notifyChange('movements', 'deleted', { id: result.movement.id });
    res.json({ ok: true, deleted: result.movement });
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
