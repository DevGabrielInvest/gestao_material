import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALID_PRIORITIES, VALID_REQUEST_STATUS, VALIDATION_LIMITS } from '../config.js';
import {
  INVALID_QUERY,
  validateString,
  validateNumber,
  validateEnum,
  validationError,
  optionalQueryDate,
  optionalQueryEnum,
  optionalQueryString,
  parsePositiveId,
  logActivity,
  todayLocal,
} from '../validation.js';
import { notifyChange } from '../events.js';

const router = Router();
const { maxInteger } = VALIDATION_LIMITS.number;

router.get('/api/requests', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.requests.defaultLimit, 1), PAGINATION.requests.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = optionalQueryString(req, res, 'search');
    const statusFilter = optionalQueryEnum(req, res, 'status', VALID_REQUEST_STATUS);
    const dateFrom = optionalQueryDate(req, res, 'dateFrom');
    const dateTo = optionalQueryDate(req, res, 'dateTo');
    if ([search, statusFilter, dateFrom, dateTo].includes(INVALID_QUERY)) return;
    const filters = [];
    const isGlobal = ['admin', 'manager', 'viewer'].includes(req.user.role);
    if (!isGlobal) {
      filters.push(sql`(requester_email = ${req.user.email} OR requester = ${req.user.name})`);
    }
    if (search) filters.push(sql`(item ILIKE ${'%' + search + '%'} OR requester ILIKE ${'%' + search + '%'} OR department ILIKE ${'%' + search + '%'})`);
    if (statusFilter) {
      filters.push(sql`status = ${statusFilter}`);
    }
    if (dateFrom) filters.push(sql`date >= ${dateFrom}`);
    if (dateTo) filters.push(sql`date <= ${dateTo}`);
    const where = filters.length ? sql`WHERE ${filters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const countResult = await sql`SELECT COUNT(*) as count FROM requests ${where}`;
    const total = Number(countResult[0].count);
    const requests = await sql`SELECT * FROM requests ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const ids = requests.map((r) => r.id);
    const historyRows = ids.length
      ? await sql`SELECT * FROM request_history WHERE request_id IN ${sql(ids)} ORDER BY id ASC`
      : [];
    const historyByRequest = new Map();
    historyRows.forEach((row) => {
      const list = historyByRequest.get(row.request_id) || [];
      list.push(row);
      historyByRequest.set(row.request_id, list);
    });
    requests.forEach((r) => { r.history = historyByRequest.get(r.id) || []; });
    res.json({ data: requests, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/requests', authMiddleware, roleMiddleware('admin', 'manager', 'requester'), async (req, res) => {
  try {
    const { item, quantity, priority, reason } = req.body;
    const requester = req.user.name;
    const department = req.user.department;
    let err;
    if ((err = validateString(item))) return validationError(res, 'item', err);
    if ((err = validateString(department))) return validationError(res, 'department', err);
    if ((err = validateNumber(quantity, 1, { integer: true, max: maxInteger }))) return validationError(res, 'quantity', err);
    if ((err = validateString(reason, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'reason', err);
    if (priority && (err = validateEnum(priority, VALID_PRIORITIES))) return validationError(res, 'priority', err);
    const now = new Date();
    const inv = await sql`SELECT id FROM inventory WHERE LOWER(name) = ${item.toLowerCase()} LIMIT 1`;
    const inventoryId = inv.length ? inv[0].id : null;
    const created = await sql.begin(async (trx) => {
      const requests = await trx`
        INSERT INTO requests (item, inventory_id, requester, department, quantity, reason, priority, date, requester_email)
        VALUES (${item}, ${inventoryId}, ${requester}, ${department}, ${quantity}, ${reason}, ${priority || 'Normal'}, ${todayLocal()}, ${req.user.email})
        RETURNING *
      `;
      await trx`
        INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note)
        VALUES (${requests[0].id}, 'created', 'Solicitação criada', ${req.user.name}, ${req.user.role}, ${now}, ${reason})
      `;
      return requests[0];
    });
    created.history = await sql`SELECT * FROM request_history WHERE request_id = ${created.id} ORDER BY id ASC`;
    await logActivity('Nova solicitação criada', `${requester} pediu ${quantity} unidade(s) de ${item}`, req);
    notifyChange('requests', 'created', { id: created.id });
    res.status(201).json(created);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/approve', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const { note } = req.body;
    let err;
    if ((err = validateString(note, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'note', err);
    const now = new Date();
    const r = await sql.begin(async (trx) => {
      const requests = await trx`
        UPDATE requests SET status = 'approved', decided_by = ${req.user.name}, decided_at = ${now},
          decision_note = ${note}, updated_at = NOW() WHERE id = ${id} AND status = 'pending' RETURNING *
      `;
      if (!requests.length) return null;
      await trx`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${id}, 'approved', 'Solicitação aprovada', ${req.user.name}, ${req.user.role}, ${now}, ${note})`;
      return requests[0];
    });
    if (!r) return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    await logActivity('Solicitação aprovada', `${r.item} · ${r.requester}`, req);
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    notifyChange('requests', 'approved', { id: r.id });
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/reject', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const { note } = req.body;
    let err;
    if ((err = validateString(note, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'note', err);
    const now = new Date();
    const r = await sql.begin(async (trx) => {
      const requests = await trx`
        UPDATE requests SET status = 'rejected', decided_by = ${req.user.name}, decided_at = ${now},
          decision_note = ${note}, updated_at = NOW() WHERE id = ${id} AND status = 'pending' RETURNING *
      `;
      if (!requests.length) return null;
      await trx`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${id}, 'rejected', 'Solicitação recusada', ${req.user.name}, ${req.user.role}, ${now}, ${note})`;
      return requests[0];
    });
    if (!r) return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    await logActivity('Solicitação recusada', `${r.item} · ${r.requester}`, req);
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    notifyChange('requests', 'rejected', { id: r.id });
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/deliver', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const now = new Date();
    const result = await sql.begin(async (trx) => {
      const requests = await trx`
        SELECT * FROM requests WHERE id = ${id} AND status = 'approved' FOR UPDATE
      `;
      if (!requests.length) return { status: 404 };
      const r = requests[0];
      const inv = r.inventory_id
        ? await trx`SELECT * FROM inventory WHERE id = ${r.inventory_id} FOR UPDATE`
        : await trx`SELECT * FROM inventory WHERE LOWER(name) = ${r.item.toLowerCase()} LIMIT 1 FOR UPDATE`;
      if (inv.length) {
        if (inv[0].quantity < r.quantity) {
          return { status: 409, available: inv[0].quantity };
        }
        await trx`UPDATE inventory SET quantity = quantity - ${r.quantity}, updated_at = NOW() WHERE id = ${inv[0].id}`;
        await trx`
          INSERT INTO movements (inventory_id, item, code, type, quantity, date, supplier, document, responsible, notes)
          VALUES (${inv[0].id}, ${inv[0].name}, ${inv[0].code}, 'exit', ${r.quantity}, ${todayLocal()},
            ${`${r.department} · ${r.requester}`}, ${`SOL-${String(r.id).padStart(4, '0')}`}, ${req.user.name}, 'Saída gerada automaticamente na entrega da solicitação.')
        `;
      }
      const delivered = await trx`
        UPDATE requests SET status = 'delivered', updated_at = NOW() WHERE id = ${id} RETURNING *
      `;
      await trx`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${r.id}, 'delivered', 'Material entregue', ${req.user.name}, ${req.user.role}, ${now}, ${`Entrega confirmada por ${req.user.name}.`})`;
      return { status: 200, request: delivered[0] };
    });

    if (result.status === 404) return res.status(404).json({ error: 'Solicitação não encontrada ou não aprovada' });
    if (result.status === 409) {
      return res.status(409).json({ error: `Saldo insuficiente para dar baixa no estoque. Disponível: ${result.available} unidade(s). Registre uma entrada antes de confirmar a entrega.` });
    }

    const r = result.request;
    await logActivity('Material entregue', `${r.item} entregue para ${r.requester}`, req);
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    notifyChange('requests', 'delivered', { id: r.id });
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/requests/:id/history', authMiddleware, async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;
    const isGlobal = ['admin', 'manager', 'viewer'].includes(req.user.role);
    if (!isGlobal) {
      const owned = await sql`SELECT id FROM requests WHERE id = ${id} AND (requester_email = ${req.user.email} OR requester = ${req.user.name})`;
      if (!owned.length) return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    const history = await sql`SELECT * FROM request_history WHERE request_id = ${id} ORDER BY id DESC`;
    res.json(history);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
