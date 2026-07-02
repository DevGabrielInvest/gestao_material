import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from './db.js';
import {
  handleRouteError,
  logInfo,
  requestIdMiddleware,
  requestLoggingMiddleware,
} from './logger.js';
import {
  PORT,
  JWT_SECRET,
  VALID_ROLES,
  VALID_REQUEST_STATUS,
  VALID_CUSTODY_STATUS,
  VALID_MOVEMENT_TYPES,
  VALID_PRIORITIES,
  EMAIL_REGEX,
  DATE_REGEX,
  PAGINATION,
  RATE_LIMIT,
  VALIDATION_LIMITS,
  PASSWORD_MIN_LENGTH,
  JWT_EXPIRY,
  HELMET_CONFIG,
  CORS_OPTIONS,
} from './config.js';

const app = express();

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.login.windowMs,
  max: RATE_LIMIT.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: RATE_LIMIT.login.message },
});

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.api.windowMs,
  max: RATE_LIMIT.api.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: RATE_LIMIT.api.message },
});

// Security middleware
app.use(requestIdMiddleware);
app.use(helmet(HELMET_CONFIG));
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.static('public', { index: 'index.html' }));
app.use('/api', requestLoggingMiddleware);
app.use('/api', apiLimiter);

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Permissão insuficiente' });
    next();
  };
}

function validateString(value, maxLen = VALIDATION_LIMITS.string.defaultMax) {
  if (typeof value !== 'string' || !value.trim()) return 'Campo obrigatório';
  if (value.length > maxLen) return `Máximo de ${maxLen} caracteres`;
  return null;
}

function validateNumber(value, min = VALIDATION_LIMITS.number.min) {
  const num = Number(value);
  if (isNaN(num)) return 'Deve ser um número';
  if (num < min) return `Mínimo de ${min}`;
  return null;
}

function validateEnum(value, allowed) {
  if (!allowed.includes(value)) return `Valor inválido. Permitidos: ${allowed.join(', ')}`;
  return null;
}

function validateEmail(value) {
  if (!value || !EMAIL_REGEX.test(value)) return 'E-mail inválido';
  return null;
}

function validateDate(value) {
  if (!value || !DATE_REGEX.test(value)) return 'Data inválida (formato YYYY-MM-DD)';
  const d = new Date(`${value}T12:00:00`);
  if (isNaN(d.getTime())) return 'Data inválida';
  return null;
}

function validationError(res, field, message) {
  return res.status(400).json({ error: `${field}: ${message}` });
}

function parsePositiveId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'ID inválido' });
    return null;
  }
  return id;
}

app.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    handleRouteError(err, req, res);
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    let err;
    if ((err = validateEmail(email))) return validationError(res, 'email', err);
    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return validationError(res, 'password', `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users.length) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token, user: payload });
  } catch (err) { handleRouteError(err, req, res); }
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

// ─── Dashboard ────────────────────────────────────────────────────────────────

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const inventoryCount = (await sql`SELECT COUNT(*) FROM inventory`)[0].count;
    const categories = (await sql`SELECT COUNT(DISTINCT category) FROM inventory`)[0].count;
    const lowStock = await sql`SELECT COUNT(*) FROM inventory WHERE quantity <= minimum`;
    const activeCustody = await sql`SELECT COUNT(*) FROM custody WHERE status = 'active'`;
    const pendingRequests = await sql`SELECT COUNT(*) FROM requests WHERE status = 'pending'`;
    res.json({
      inventoryCount: Number(inventoryCount),
      categories: Number(categories),
      lowStock: Number(lowStock[0].count),
      activeCustody: Number(activeCustody[0].count),
      pendingRequests: Number(pendingRequests[0].count),
    });
  } catch (err) { handleRouteError(err, req, res); }
});

// ─── Inventory ────────────────────────────────────────────────────────────────

app.get('/api/inventory', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.inventory.defaultLimit, 1), PAGINATION.inventory.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM inventory`;
    const total = Number(countResult[0].count);
    const items = await sql`SELECT * FROM inventory ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: items, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

function validateInventoryBody(req, res) {
  const { name, code, category, location, quantity, minimum, value } = req.body;
  let err;
  if ((err = validateString(name))) return validationError(res, 'name', err);
  if ((err = validateString(code))) return validationError(res, 'code', err);
  if ((err = validateString(category))) return validationError(res, 'category', err);
  if ((err = validateString(location))) return validationError(res, 'location', err);
  if (quantity !== undefined && (err = validateNumber(quantity))) return validationError(res, 'quantity', err);
  if (minimum !== undefined && (err = validateNumber(minimum))) return validationError(res, 'minimum', err);
  if (value !== undefined && (err = validateNumber(value))) return validationError(res, 'value', err);
  return null;
}

app.post('/api/inventory', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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
    res.status(201).json(items[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

app.put('/api/inventory/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const validationErrorResult = validateInventoryBody(req, res);
    if (validationErrorResult) return;
    const { id } = req.params;
    const { name, code, category, location, quantity, minimum, value, valuable } = req.body;
    const items = await sql`
      UPDATE inventory SET name = ${name}, code = ${code}, category = ${category},
        location = ${location}, quantity = ${quantity ?? 1}, minimum = ${minimum ?? 1},
        value = ${value ?? 0}, valuable = ${!!valuable}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    if (!items.length) return res.status(404).json({ error: 'Item não encontrado' });
    await logActivity('Cadastro atualizado', `${name} · ${quantity} unidade(s)`, req);
    res.json(items[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

app.delete('/api/inventory/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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
    res.json({ ok: true, deleted: result.item });
  } catch (err) { handleRouteError(err, req, res); }
});

// ─── Requests ─────────────────────────────────────────────────────────────────

app.get('/api/requests', authMiddleware, async (req, res) => {
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

app.post('/api/requests', authMiddleware, roleMiddleware('admin', 'manager', 'requester'), async (req, res) => {
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
      INSERT INTO requests (item, requester, department, quantity, reason, priority, date, status, requester_email)
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

app.put('/api/requests/:id/approve', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

app.put('/api/requests/:id/reject', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

app.put('/api/requests/:id/deliver', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

app.get('/api/requests/:id/history', authMiddleware, async (req, res) => {
  try {
    const history = await sql`SELECT * FROM request_history WHERE request_id = ${req.params.id} ORDER BY id DESC`;
    res.json(history);
  } catch (err) { handleRouteError(err, req, res); }
});

// ─── Custody ──────────────────────────────────────────────────────────────────

app.get('/api/custody', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.custody.defaultLimit, 1), PAGINATION.custody.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM custody`;
    const total = Number(countResult[0].count);
    const records = await sql`SELECT * FROM custody ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: records, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

app.post('/api/custody', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

app.put('/api/custody/:id/return', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

// ─── Movements ────────────────────────────────────────────────────────────────

app.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.movements.defaultLimit, 1), PAGINATION.movements.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM movements`;
    const total = Number(countResult[0].count);
    const movements = await sql`SELECT * FROM movements ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: movements, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

app.post('/api/movements', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

app.delete('/api/movements/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
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

// ─── Activity ─────────────────────────────────────────────────────────────────

app.get('/api/activity', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.activity.defaultLimit, 1), PAGINATION.activity.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM activity`;
    const total = Number(countResult[0].count);
    const activities = await sql`SELECT * FROM activity ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: activities, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

async function logActivity(text, detail, req) {
  await sql`INSERT INTO activity (text, detail, date) VALUES (${text}, ${detail}, NOW())`;
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logInfo('server_started', {
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
  });
});
