import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

let createdCustodyId;

test.afterEach(async () => {
  if (createdCustodyId) {
    await sql`DELETE FROM custody WHERE id = ${createdCustodyId}`;
    createdCustodyId = null;
  }
});

test('GET /api/custody returns paginated list', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/custody', { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data.data), true);
  assert.equal(typeof data.total, 'number');
});

test('GET /api/custody without auth returns 401', async () => {
  const { status } = await api('GET', '/api/custody');
  assert.equal(status, 401);
});

test('GET /api/custody rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('GET', '/api/custody', { token });
  assert.equal(status, 403);
});

test('POST /api/custody creates custody term as admin', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const inventoryId = inv.data.data[0]?.id;
  if (!inventoryId) return;

  const { status, data } = await api('POST', '/api/custody', {
    token,
    body: {
      inventoryId,
      holder: 'Teste Holder',
      department: 'Teste',
      checkout: '2026-07-01',
      expected: '2026-08-01',
      notes: 'Teste de integração',
    },
  });
  assert.equal(status, 201);
  assert.equal(data.holder, 'Teste Holder');
  assert.equal(data.status, 'active');
  createdCustodyId = data.id;

  await sql`UPDATE inventory SET location = 'Armário de equipamentos' WHERE id = ${inventoryId}`;
});

test('POST /api/custody rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('POST', '/api/custody', {
    token,
    body: { inventoryId: 1, holder: 'Teste', department: 'Teste', checkout: '2026-07-01', expected: '2026-08-01' },
  });
  assert.equal(status, 403);
});

test('POST /api/custody with invalid inventoryId returns 404', async () => {
  const token = await adminToken();
  const { status } = await api('POST', '/api/custody', {
    token,
    body: { inventoryId: 999999, holder: 'Teste', department: 'Teste', checkout: '2026-07-01', expected: '2026-08-01' },
  });
  assert.equal(status, 404);
});

test('PUT /api/custody/:id/return rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('PUT', '/api/custody/1/return', { token });
  assert.equal(status, 403);
});

test('GET /api/custody/:id/pdf rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('GET', '/api/custody/1/pdf', { token });
  assert.equal(status, 403);
});

test('PUT /api/custody/:id/return returns active custody', async () => {
  const token = await adminToken();
  const inv = await api('GET', '/api/inventory?limit=1', { token });
  const inventoryId = inv.data.data[0]?.id;
  if (!inventoryId) return;

  const created = await api('POST', '/api/custody', {
    token,
    body: { inventoryId, holder: 'Teste Return', department: 'Teste', checkout: '2026-07-01', expected: '2026-08-01' },
  });
  createdCustodyId = created.data.id;

  const { status, data } = await api('PUT', `/api/custody/${created.data.id}/return`, { token });
  assert.equal(status, 200);
  assert.equal(data.status, 'returned');

  await sql`UPDATE inventory SET location = 'Armário de equipamentos' WHERE id = ${inventoryId}`;
});
