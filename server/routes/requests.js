import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION, VALID_PRIORITIES, VALIDATION_LIMITS } from '../config.js';
import {
  validateString, validateNumber, validateEnum, validationError, logActivity,
} from '../validation.js';

const router = Router();

router.get('/api/requests', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.requests.defaultLimit, 1), PAGINATION.requests.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    let countQuery, dataQuery;
    if (['admin', 'manager', 'viewer'].includes(req.user.role)) {
      countQuery = sql`SELECT COUNT(*) as count FROM requests`;
      dataQuery = sql`SELECT * FROM requests ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    } else {
      countQuery = sql`SELECT COUNT(*) as count FROM requests WHERE requester_email = ${req.user.email} OR requester = ${req.user.name}`;
      dataQuery = sql`SELECT * FROM requests WHERE requester_email = ${req.user.email} OR requester = ${req.user.name} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    }
    const countResult = await countQuery;
    const total = Number(countResult[0].count);
    const requests = await dataQuery;
    for (const r of requests) {
      r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    }
    res.json({ data: requests, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/requests', authMiddleware, roleMiddleware('admin', 'manager', 'requester'), async (req, res) => {
  try {
    const { item, requester, department, quantity, priority, reason } = req.body;
    let err;
    if ((err = validateString(item))) return validationError(res, 'item', err);
    if ((err = validateString(requester))) return validationError(res, 'requester', err);
    if ((err = validateString(department))) return validationError(res, 'department', err);
    if ((err = validateNumber(quantity, 1))) return validationError(res, 'quantity', err);
    if ((err = validateString(reason, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'reason', err);
    if (priority && (err = validateEnum(priority, VALID_PRIORITIES))) return validationError(res, 'priority', err);
    const now = new Date();
    const requests = await sql`
      INSERT INTO requests (item, requester, department, quantity, reason, priority, date, requester_email)
      VALUES (${item}, ${requester}, ${department}, ${quantity}, ${reason}, ${priority || 'Normal'}, ${now.toISOString().slice(0, 10)}, ${req.user.email})
      RETURNING *
    `;
    const created = requests[0];
    await sql`
      INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note)
      VALUES (${created.id}, 'created', 'Solicitação criada', ${req.user.name}, ${req.user.role}, ${now}, ${reason})
    `;
    created.history = await sql`SELECT * FROM request_history WHERE request_id = ${created.id} ORDER BY id ASC`;
    await logActivity('Nova solicitação criada', `${requester} pediu ${quantity} unidade(s) de ${item}`, req);
    res.status(201).json(created);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/approve', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    let err;
    if ((err = validateString(note, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'note', err);
    const now = new Date();
    const requests = await sql`
      UPDATE requests SET status = 'approved', decided_by = ${req.user.name}, decided_at = ${now},
        decision_note = ${note}, updated_at = NOW() WHERE id = ${id} AND status = 'pending' RETURNING *
    `;
    if (!requests.length) return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    await sql`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${id}, 'approved', 'Solicitação aprovada', ${req.user.name}, ${req.user.role}, ${now}, ${note})`;
    await logActivity('Solicitação aprovada', `${requests[0].item} · ${requests[0].requester}`, req);
    const r = requests[0];
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/reject', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    let err;
    if ((err = validateString(note, VALIDATION_LIMITS.string.reasonMax))) return validationError(res, 'note', err);
    const now = new Date();
    const requests = await sql`
      UPDATE requests SET status = 'rejected', decided_by = ${req.user.name}, decided_at = ${now},
        decision_note = ${note}, updated_at = NOW() WHERE id = ${id} AND status = 'pending' RETURNING *
    `;
    if (!requests.length) return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    await sql`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${id}, 'rejected', 'Solicitação recusada', ${req.user.name}, ${req.user.role}, ${now}, ${note})`;
    await logActivity('Solicitação recusada', `${requests[0].item} · ${requests[0].requester}`, req);
    const r = requests[0];
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.put('/api/requests/:id/deliver', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const requests = await sql`
      UPDATE requests SET status = 'delivered', updated_at = NOW() WHERE id = ${id} AND status = 'approved' RETURNING *
    `;
    if (!requests.length) return res.status(404).json({ error: 'Solicitação não encontrada ou não aprovada' });
    const r = requests[0];
    await sql`INSERT INTO request_history (request_id, action, label, user_name, user_role, date, note) VALUES (${r.id}, 'delivered', 'Material entregue', ${req.user.name}, ${req.user.role}, ${now}, ${`Entrega confirmada por ${req.user.name}.`})`;
    const inv = await sql`SELECT * FROM inventory WHERE LOWER(name) = ${r.item.toLowerCase()} LIMIT 1`;
    if (inv.length && inv[0].quantity >= r.quantity) {
      await sql`UPDATE inventory SET quantity = quantity - ${r.quantity}, updated_at = NOW() WHERE id = ${inv[0].id}`;
      await sql`
        INSERT INTO movements (inventory_id, item, code, type, quantity, date, supplier, document, responsible, notes)
        VALUES (${inv[0].id}, ${inv[0].name}, ${inv[0].code}, 'exit', ${r.quantity}, ${now.toISOString().slice(0, 10)},
          ${`${r.department} · ${r.requester}`}, ${`SOL-${String(r.id).padStart(4, '0')}`}, ${req.user.name}, 'Saída gerada automaticamente na entrega da solicitação.')
      `;
    }
    await logActivity('Material entregue', `${r.item} entregue para ${r.requester}`, req);
    r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    res.json(r);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/requests/:id/history', authMiddleware, async (req, res) => {
  try {
    const history = await sql`SELECT * FROM request_history WHERE request_id = ${req.params.id} ORDER BY id DESC`;
    res.json(history);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
