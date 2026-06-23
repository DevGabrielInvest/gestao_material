import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

app.use(cors());
app.use(express.json());
app.use(express.static('.', { index: 'index.html' }));

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users.length) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: payload });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Inventory ────────────────────────────────────────────────────────────────

app.get('/api/inventory', authMiddleware, async (req, res) => {
  try {
    const items = await sql`SELECT * FROM inventory ORDER BY id`;
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { name, code, category, location, quantity, minimum, value, valuable } = req.body;
    const items = await sql`
      INSERT INTO inventory (name, code, category, location, quantity, minimum, value, valuable)
      VALUES (${name}, ${code}, ${category}, ${location}, ${quantity ?? 1}, ${minimum ?? 1}, ${value ?? 0}, ${!!valuable})
      RETURNING *
    `;
    await logActivity('Novo item cadastrado', `${name} · ${quantity} unidade(s)`, req);
    res.status(201).json(items[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/inventory/:id', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Requests ─────────────────────────────────────────────────────────────────

app.get('/api/requests', authMiddleware, async (req, res) => {
  try {
    let requests;
    if (['admin', 'manager', 'viewer'].includes(req.user.role)) {
      requests = await sql`SELECT * FROM requests ORDER BY id DESC`;
    } else {
      requests = await sql`SELECT * FROM requests WHERE requester_email = ${req.user.email} OR requester = ${req.user.name} ORDER BY id DESC`;
    }
    for (const r of requests) {
      r.history = await sql`SELECT * FROM request_history WHERE request_id = ${r.id} ORDER BY id ASC`;
    }
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/requests', authMiddleware, roleMiddleware('admin', 'manager', 'requester'), async (req, res) => {
  try {
    const { item, requester, department, quantity, priority, reason } = req.body;
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/requests/:id/approve', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/requests/:id/reject', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
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
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/requests/:id/history', authMiddleware, async (req, res) => {
  try {
    const history = await sql`SELECT * FROM request_history WHERE request_id = ${req.params.id} ORDER BY id DESC`;
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Custody ──────────────────────────────────────────────────────────────────

app.get('/api/custody', authMiddleware, async (req, res) => {
  try {
    const records = await sql`SELECT * FROM custody ORDER BY id DESC`;
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/custody', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { inventoryId, holder, department, checkout, expected, notes } = req.body;
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
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Movements ────────────────────────────────────────────────────────────────

app.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const movements = await sql`SELECT * FROM movements ORDER BY id DESC`;
    res.json(movements);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/movements', authMiddleware, roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const { inventoryId, type, quantity, date, supplier, document, notes } = req.body;
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Activity ─────────────────────────────────────────────────────────────────

app.get('/api/activity', authMiddleware, async (req, res) => {
  try {
    const activities = await sql`SELECT * FROM activity ORDER BY date DESC LIMIT 10`;
    res.json(activities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function logActivity(text, detail, req) {
  await sql`INSERT INTO activity (text, detail, date) VALUES (${text}, ${detail}, NOW())`;
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
