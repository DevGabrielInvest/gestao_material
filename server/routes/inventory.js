import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION } from '../config.js';
import { validateInventoryBody, parsePositiveId, logActivity } from '../validation.js';
import { notifyChange } from '../events.js';

const router = Router();

router.get('/api/inventory/categories', authMiddleware, async (req, res) => {
  try {
    const rows = await sql`SELECT DISTINCT category FROM inventory ORDER BY category`;
    res.json(rows.map((row) => row.category));
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/inventory', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.inventory.defaultLimit, 1), PAGINATION.inventory.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const { search, category: catFilter, lowStock, status } = req.query;
    const sort = ['name', 'code', 'category', 'location', 'quantity', 'minimum', 'value', 'id'].includes(req.query.sort) ? req.query.sort : 'id';
    const order = req.query.order === 'desc' ? sql`DESC` : sql`ASC`;
    const inActiveCustody = sql`EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = inventory.id AND c.status = 'active')`;
    const filters = [];
    if (search) filters.push(sql`(name ILIKE ${'%' + search + '%'} OR code ILIKE ${'%' + search + '%'} OR category ILIKE ${'%' + search + '%'} OR location ILIKE ${'%' + search + '%'})`);
    if (catFilter) filters.push(sql`category = ${catFilter}`);
    if (lowStock === 'true' || lowStock === '1') filters.push(sql`quantity <= minimum`);
    if (status === 'custody') filters.push(inActiveCustody);
    if (status === 'low') filters.push(sql`(quantity <= minimum AND NOT ${inActiveCustody})`);
    if (status === 'available') filters.push(sql`(quantity > minimum AND NOT ${inActiveCustody})`);
    const where = filters.length ? sql`WHERE ${filters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const countResult = await sql`SELECT COUNT(*) as count FROM inventory ${where}`;
    const total = Number(countResult[0].count);
    const items = await sql`
      SELECT *, ${inActiveCustody} AS in_custody
      FROM inventory ${where} ORDER BY ${sql(sort)} ${order} LIMIT ${limit} OFFSET ${offset}
    `;
    const summaryRow = (await sql`
      SELECT COUNT(*) AS count, COALESCE(SUM(quantity), 0) AS units, COALESCE(SUM(quantity * value), 0) AS total_value
      FROM inventory
    `)[0];
    const summary = { count: Number(summaryRow.count), units: Number(summaryRow.units), value: Number(summaryRow.total_value) };
    res.json({ data: items, total, limit, offset, hasMore: offset + limit < total, summary });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/inventory', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const validationErrorResult = validateInventoryBody(req, res);
    if (validationErrorResult) return;
    const { name, code, category, location, quantity, minimum, value, valuable } = req.body;
    const items = await sql`
      INSERT INTO inventory (name, code, category, location, quantity, minimum, value, valuable)
      VALUES (${name}, ${code}, ${category}, ${location}, ${quantity ?? 1}, ${minimum ?? 1}, ${value ?? 0}, ${!!valuable})
      RETURNING *
    `;
    await logActivity('Novo item cadastrado', `${name} · ${quantity} unidade(s)`, req);
    notifyChange('inventory', 'created', { id: items[0].id });
    res.status(201).json(items[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/inventory/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const validationErrorResult = validateInventoryBody(req, res);
    if (validationErrorResult) return;
    const { name, code, category, location, quantity, minimum, value, valuable } = req.body;
    const items = await sql`
      UPDATE inventory SET name = ${name}, code = ${code}, category = ${category},
        location = ${location}, quantity = ${quantity ?? 1}, minimum = ${minimum ?? 1},
        value = ${value ?? 0}, valuable = ${!!valuable}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!items.length) return res.status(404).json({ error: 'Item não encontrado' });
    await logActivity('Cadastro atualizado', `${name} · ${quantity} unidade(s)`, req);
    notifyChange('inventory', 'updated', { id: items[0].id });
    res.json(items[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

router.delete('/api/inventory/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const result = await sql.begin(async (trx) => {
      const items = await trx`SELECT * FROM inventory WHERE id = ${id} FOR UPDATE`;
      if (!items.length) return { status: 404 };

      const links = await trx`
        SELECT
          (SELECT COUNT(*)::int FROM custody WHERE inventory_id = ${id}) AS custody_count,
          (SELECT COUNT(*)::int FROM movements WHERE inventory_id = ${id}) AS movement_count
      `;
      if (links[0].custody_count > 0 || links[0].movement_count > 0) {
        return { status: 409 };
      }

      const deleted = await trx`DELETE FROM inventory WHERE id = ${id} RETURNING *`;
      return { status: 200, item: deleted[0] };
    });

    if (result.status === 404) return res.status(404).json({ error: 'Item não encontrado' });
    if (result.status === 409) {
      return res.status(409).json({ error: 'Item possui movimentações ou termos vinculados. Preserve o histórico antes de excluir.' });
    }

    await logActivity('Item removido do inventário', `${result.item.name} · ${result.item.code}`, req);
    notifyChange('inventory', 'deleted', { id: result.item.id });
    res.json({ ok: true, deleted: result.item });
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
