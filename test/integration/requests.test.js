import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

let createdRequestId;
let createdInventoryId;

test.afterEach(async () => {
  if (createdRequestId) {
    await sql`DELETE FROM movements WHERE document = ${`SOL-${String(createdRequestId).padStart(4, '0')}`}`;
    await sql`DELETE FROM request_history WHERE request_id = ${createdRequestId}`;
    await sql`DELETE FROM requests WHERE id = ${createdRequestId}`;
    createdRequestId = null;
  }
  if (createdInventoryId) {
    await sql`DELETE FROM inventory WHERE id = ${createdInventoryId}`;
    createdInventoryId = null;
  }
});

test('GET /api/requests returns paginated list', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/requests', { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data.data), true);
  assert.equal(typeof data.total, 'number');
});

test('GET /api/requests without auth returns 401', async () => {
  const { status } = await api('GET', '/api/requests');
  assert.equal(status, 401);
});

test('POST /api/requests creates request as requester', async () => {
  const token = await requesterToken();
  const { status, data } = await api('POST', '/api/requests', {
    token,
    body: {
      item: 'TEST-Item Solicitação',
      requester: 'Teste',
      department: 'Jurídico',
      quantity: 3,
      reason: 'Teste de integração',
      priority: 'Normal',
    },
  });
  assert.equal(status, 201);
  assert.equal(data.item, 'TEST-Item Solicitação');
  assert.equal(data.status, 'pending');
  assert.equal(data.requester_email, 'colaborador@dfa.com');
  createdRequestId = data.id;
});

test('POST /api/requests without item returns 400', async () => {
  const token = await requesterToken();
  const { status, data } = await api('POST', '/api/requests', {
    token,
    body: { requester: 'Teste', department: 'Jurídico', quantity: 1, reason: 'Teste' },
  });
  assert.equal(status, 400);
});

test('PUT /api/requests/:id/approve approves a pending request', async () => {
  const token = await requesterToken();
  const created = await api('POST', '/api/requests', {
    token,
    body: { item: 'TEST-Aprovacao', requester: 'Teste', department: 'Jurídico', quantity: 1, reason: 'Teste aprovação' },
  });
  createdRequestId = created.data.id;

  const adminTok = await adminToken();
  const { status, data } = await api('PUT', `/api/requests/${created.data.id}/approve`, {
    token: adminTok,
    body: { note: 'Aprovado em teste' },
  });
  assert.equal(status, 200);
  assert.equal(data.status, 'approved');
});

test('PUT /api/requests/:id/reject rejects a pending request', async () => {
  const token = await requesterToken();
  const created = await api('POST', '/api/requests', {
    token,
    body: { item: 'TEST-Rejeicao', requester: 'Teste', department: 'Jurídico', quantity: 1, reason: 'Teste rejeição' },
  });
  createdRequestId = created.data.id;

  const adminTok = await adminToken();
  const { status, data } = await api('PUT', `/api/requests/${created.data.id}/reject`, {
    token: adminTok,
    body: { note: 'Rejeitado em teste' },
  });
  assert.equal(status, 200);
  assert.equal(data.status, 'rejected');
});

test('PUT /api/requests/:id/approve without note returns 400', async () => {
  const token = await requesterToken();
  const created = await api('POST', '/api/requests', {
    token,
    body: { item: 'TEST-NoNote', requester: 'Teste', department: 'Jurídico', quantity: 1, reason: 'Teste sem nota' },
  });
  createdRequestId = created.data.id;

  const adminTok = await adminToken();
  const { status } = await api('PUT', `/api/requests/${created.data.id}/approve`, {
    token: adminTok,
    body: {},
  });
  assert.equal(status, 400);
});

test('GET /api/requests/:id/history returns request history', async () => {
  const token = await requesterToken();
  const created = await api('POST', '/api/requests', {
    token,
    body: { item: 'TEST-History', requester: 'Teste', department: 'Jurídico', quantity: 1, reason: 'Teste histórico' },
  });
  createdRequestId = created.data.id;

  const { status, data } = await api('GET', `/api/requests/${created.data.id}/history`, { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data), true);
  assert.equal(data.length >= 1, true);
});

test('PUT /api/requests/:id/deliver preserves approved status when stock is insufficient', async () => {
  const itemName = 'TEST-Estoque Insuficiente';
  const inventory = await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value)
    VALUES (${itemName}, 'TEST-REQ-STOCK', 'Teste', 'Teste', 1, 0, 10)
    RETURNING id
  `;
  createdInventoryId = inventory[0].id;

  const requesterTok = await requesterToken();
  const created = await api('POST', '/api/requests', {
    token: requesterTok,
    body: { item: itemName, quantity: 2, reason: 'Teste sem saldo' },
  });
  createdRequestId = created.data.id;

  const adminTok = await adminToken();
  await api('PUT', `/api/requests/${createdRequestId}/approve`, {
    token: adminTok,
    body: { note: 'Aprovado para testar saldo' },
  });

  const delivered = await api('PUT', `/api/requests/${createdRequestId}/deliver`, { token: adminTok });
  assert.equal(delivered.status, 409);

  const rows = await sql`SELECT status FROM requests WHERE id = ${createdRequestId}`;
  assert.equal(rows[0].status, 'approved');
});
