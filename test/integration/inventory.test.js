import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

test.afterEach(async () => {
  await sql`DELETE FROM inventory WHERE name LIKE 'TEST-%'`;
});

const testItem = {
  name: 'TEST-Item Teste',
  code: 'TEST-001',
  category: 'Teste',
  location: 'Teste',
  quantity: 10,
  minimum: 2,
  value: 100.50,
};

test('GET /api/inventory returns paginated list', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/inventory', { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data.data), true);
  assert.equal(typeof data.total, 'number');
  assert.equal(typeof data.hasMore, 'boolean');
});

test('GET /api/inventory without auth returns 401', async () => {
  const { status } = await api('GET', '/api/inventory');
  assert.equal(status, 401);
});

test('POST /api/inventory creates item as admin', async () => {
  const token = await adminToken();
  const { status, data } = await api('POST', '/api/inventory', {
    token,
    body: testItem,
  });
  assert.equal(status, 201);
  assert.equal(data.name, testItem.name);
  assert.equal(data.code, testItem.code);
  assert.equal(data.quantity, testItem.quantity);
  assert.equal(Number(data.value), testItem.value);
});

test('POST /api/inventory rejects requester role', async () => {
  const token = await requesterToken();
  const { status, data } = await api('POST', '/api/inventory', {
    token,
    body: testItem,
  });
  assert.equal(status, 403);
});

test('POST /api/inventory without name returns 400', async () => {
  const token = await adminToken();
  const { status, data } = await api('POST', '/api/inventory', {
    token,
    body: { code: 'TEST-002', category: 'Teste', location: 'Teste' },
  });
  assert.equal(status, 400);
  assert(data.error.includes('nome') || data.error.includes('name'));
});

test('PUT /api/inventory/:id updates item', async () => {
  const token = await adminToken();
  const created = await api('POST', '/api/inventory', { token, body: testItem });
  const { status, data } = await api('PUT', `/api/inventory/${created.data.id}`, {
    token,
    body: { ...testItem, name: 'TEST-Item Atualizado', quantity: 20 },
  });
  assert.equal(status, 200);
  assert.equal(data.name, 'TEST-Item Atualizado');
  assert.equal(data.quantity, 20);
});

test('DELETE /api/inventory/:id deletes item without links', async () => {
  const token = await adminToken();
  const created = await api('POST', '/api/inventory', { token, body: testItem });
  const { status, data } = await api('DELETE', `/api/inventory/${created.data.id}`, { token });
  assert.equal(status, 200);
  assert.equal(data.ok, true);
});

test('DELETE /api/inventory/:id with non-existent id returns 404', async () => {
  const token = await adminToken();
  const { status } = await api('DELETE', '/api/inventory/999999', { token });
  assert.equal(status, 404);
});
