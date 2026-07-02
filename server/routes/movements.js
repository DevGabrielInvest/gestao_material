import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALID_MOVEMENT_TYPES, VALIDATION_LIMITS } from '../config.js';
import { validateNumber, validateEnum, validateDate, validationError, parsePositiveId, logActivity } from '../validation.js';

const router = Router();

router.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.movements.defaultLimit, 1), PAGINATION.movements.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM movements`;
    const total = Number(countResult[0].count);
    const movements = await sql`SELECT * FROM movements ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: movements, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/movements', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { inventoryId, type, quantity, date, supplier, document, notes } = req.body;
    let err;
    if ((err = validateNumber(inventoryId, 1))) return validationError(res, 'inventoryId', err);
    if ((err = validateEnum(type, VALID_MOVEMENT_TYPES))) return validationError(res, 'type', err);
    if ((err = validateNumber(quantity, 1))) return validationError(res, 'quantity', err);
    if ((err = validateDate(date))) return validationError(res, 'date', err);
    if (supplier && supplier.length > VALIDATION_LIMITS.string.defaultMax) return validationError(res, 'supplier', `Máximo de ${VALIDATION_LIMITS.string.defaultMax} caracteres`);
    if (document && document.length > VALIDATION_LIMITS.string.defaultMax) return validationError(res, 'document', `Máximo de ${VALIDATION_LIMITS.string.defaultMax} caracteres`);
    const inv = await sql`SELECT * FROM inventory WHERE id = ${inventoryId}`;
    if (!inv.length) return res.status(404).json({ error: 'Item não encontrado' });
    const item = inv[0];
    if (type === 'exit' && quantity > item.quantity) return res.status(400).json({ error: `Saldo insuficiente. Disponível: ${item.quantity}` });
    await sql`UPDATE inventory SET quantity = quantity ${type === 'entry' ? sql`+` : sql`-`} ${quantity}, updated_at = NOW() WHERE id = ${inventoryId}`;
    const movements = await sql`
      INSERT INTO movements (inventory_id, item, code, type, quantity, date, supplier, document, responsible, notes)
      VALUES (${item.id}, ${item.name}, ${item.code}, ${type}, ${quantity}, ${date}, ${supplier || ''}, ${document || ''}, ${req.user.name}, ${notes || ''})
      RETURNING *
    `;
    await logActivity(type === 'entry' ? 'Entrada de estoque registrada' : 'Saída de estoque registrada', `${item.name} · ${quantity} unidade(s) · ${req.user.name}`, req);
    res.status(201).json(movements[0]);
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
    res.json({ ok: true, deleted: result.movement });
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
