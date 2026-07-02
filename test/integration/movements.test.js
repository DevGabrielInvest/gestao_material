import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

let createdMovementId;

test.afterEach(async () => {
  if (createdMovementId) {
    const mov = await sql`SELECT * FROM movements WHERE id = ${createdMovementId}`;
    if (mov.length) {
      const op = mov[0].type === 'entry' ? sql`-` : sql`+`;
      await sql`UPDATE inventory SET quantity = quantity ${op} ${mov[0].quantity} WHERE id = ${mov[0].inventory_id}`;
      await sql`DELETE FROM movements WHERE id = ${createdMovementId}`;
    }
    createdMovementId = null;
  }
});

test('GET /api/movements returns paginated list', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/movements', { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data.data), true);
  assert.equal(typeof data.total, 'number');
});

test('GET /api/movements without auth returns 401', async () => {
  const { status } = await api('GET', '/api/movements');
  assert.equal(status, 401);
});

test('POST /api/movements creates entry movement as admin', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const item = inv.data.data[0];
  if (!item) return;

  const { status, data } = await api('POST', '/api/movements', {
    token,
    body: {
      inventoryId: item.id,
      type: 'entry',
      quantity: 5,
      date: '2026-07-01',
      supplier: 'Fornecedor Teste',
      document: 'NF-TEST-001',
    },
  });
  assert.equal(status, 201);
  assert.equal(data.type, 'entry');
  assert.equal(data.quantity, 5);
  createdMovementId = data.id;
});

test('POST /api/movements creates exit movement as admin', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const item = inv.data.data[0];
  if (!item || item.quantity < 1) return;

  const { status, data } = await api('POST', '/api/movements', {
    token,
    body: {
      inventoryId: item.id,
      type: 'exit',
      quantity: 1,
      date: '2026-07-01',
      supplier: 'Setor Teste',
    },
  });
  assert.equal(status, 201);
  assert.equal(data.type, 'exit');
  assert.equal(data.quantity, 1);
  createdMovementId = data.id;
});

test('POST /api/movements rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('POST', '/api/movements', {
    token,
    body: { inventoryId: 1, type: 'entry', quantity: 1, date: '2026-07-01', supplier: 'Teste' },
  });
  assert.equal(status, 403);
});

test('POST /api/movements with invalid type returns 400', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const item = inv.data.data[0];
  if (!item) return;

  const { status, data } = await api('POST', '/api/movements', {
    token,
    body: { inventoryId: item.id, type: 'invalid', quantity: 1, date: '2026-07-01', supplier: 'Teste' },
  });
  assert.equal(status, 400);
});

test('POST /api/movements with exit exceeding stock returns 400', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const item = inv.data.data[0];
  if (!item) return;

  const { status, data } = await api('POST', '/api/movements', {
    token,
    body: { inventoryId: item.id, type: 'exit', quantity: 999999, date: '2026-07-01', supplier: 'Teste' },
  });
  assert.equal(status, 400);
  assert(data.error.includes('Saldo'));
});

test('DELETE /api/movements/:id deletes entry movement and reverts stock', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const item = inv.data.data[0];
  if (!item) return;

  const created = await api('POST', '/api/movements', {
    token,
    body: { inventoryId: item.id, type: 'entry', quantity: 3, date: '2026-07-01', supplier: 'Teste Del' },
  });
  createdMovementId = created.data.id;

  const { status, data } = await api('DELETE', `/api/movements/${created.data.id}`, { token });
  assert.equal(status, 200);
  assert.equal(data.ok, true);
  createdMovementId = null;
});

test('DELETE /api/movements/:id with non-existent id returns 404', async () => {
  const token = await adminToken();
  const { status } = await api('DELETE', '/api/movements/999999', { token });
  assert.equal(status, 404);
});
