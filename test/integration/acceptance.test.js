import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, getBaseUrl, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

let createdInventoryId;
let createdCustodyId;

test.afterEach(async () => {
  if (createdCustodyId) {
    await sql`DELETE FROM audit_trail WHERE custody_id = ${createdCustodyId}`;
    await sql`DELETE FROM term_hashes WHERE custody_id = ${createdCustodyId}`;
    await sql`DELETE FROM acceptance_tokens WHERE custody_id = ${createdCustodyId}`;
    await sql`DELETE FROM custody WHERE id = ${createdCustodyId}`;
    createdCustodyId = null;
  }
  if (createdInventoryId) {
    await sql`DELETE FROM movements WHERE inventory_id = ${createdInventoryId}`;
    await sql`DELETE FROM custody WHERE inventory_id = ${createdInventoryId}`;
    await sql`DELETE FROM inventory WHERE id = ${createdInventoryId}`;
    createdInventoryId = null;
  }
});

test('POST /api/acceptance/:id/send-token rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('POST', '/api/acceptance/1/send-token', { token });
  assert.equal(status, 403);
});

test('GET /api/acceptance/:id/status rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('GET', '/api/acceptance/1/status', { token });
  assert.equal(status, 403);
});

test('POST /api/acceptance/:id/send-token with non-existent custody returns 404', async () => {
  const token = await adminToken();
  const { status } = await api('POST', '/api/acceptance/999999/send-token', { token });
  assert.equal(status, 404);
});

test('GET /api/acceptance/:id/status with non-existent custody returns 404', async () => {
  const token = await adminToken();
  const { status } = await api('GET', '/api/acceptance/999999/status', { token });
  assert.equal(status, 404);
});

test('POST /api/acceptance/:id/send-token with custody lacking holder_email returns 400', async () => {
  const token = await adminToken();
  const inv = await api('POST', '/api/inventory', {
    token,
    body: { name: 'TEST-Accept Item', code: 'TEST-ACC-001', category: 'Teste', location: 'Teste', quantity: 1, minimum: 0, value: 100 },
  });
  createdInventoryId = inv.data.id;

  const custody = await api('POST', '/api/custody', {
    token,
    body: { inventoryId: inv.data.id, holder: 'Teste Sem Email', department: 'Teste', checkout: '2026-07-01', expected: '2026-08-01' },
  });
  createdCustodyId = custody.data.id;

  const { status, data } = await api('POST', `/api/acceptance/${custody.data.id}/send-token`, { token });
  assert.equal(status, 400);
  assert.match(data.error, /e-mail/);
});

test('full acceptance flow: send token, check status, preview', async () => {
  const token = await adminToken();

  const inv = await api('POST', '/api/inventory', {
    token,
    body: { name: 'TEST-Accept Full', code: 'TEST-ACC-002', category: 'Teste', location: 'Teste', quantity: 1, minimum: 0, value: 200 },
  });
  createdInventoryId = inv.data.id;

  const custody = await api('POST', '/api/custody', {
    token,
    body: {
      inventoryId: inv.data.id,
      holder: 'Teste Aceite',
      holderEmail: 'teste@test.com',
      department: 'Jurídico',
      checkout: '2026-07-01',
      expected: '2026-08-01',
    },
  });
  createdCustodyId = custody.data.id;

  const statusBefore = await api('GET', `/api/acceptance/${custody.data.id}/status`, { token });
  assert.equal(statusBefore.status, 200);
  assert.equal(statusBefore.data.custody.acceptance_status, 'pending');

  const sendRes = await api('POST', `/api/acceptance/${custody.data.id}/send-token`, { token });
  assert.equal(sendRes.status, 200);
  assert.equal(sendRes.data.ok, true);

  const statusAfter = await api('GET', `/api/acceptance/${custody.data.id}/status`, { token });
  assert.equal(statusAfter.status, 200);
  assert.equal(statusAfter.data.custody.acceptance_status, 'token_sent');
  assert.equal(Array.isArray(statusAfter.data.audit), true);
});

test('POST /api/acceptance/:id/send-token on already completed custody returns 409', async () => {
  const token = await adminToken();

  await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value)
    VALUES ('TEST-Accept Duplicate', 'TEST-ACC-003', 'Teste', 'Teste', 1, 0, 50)
    RETURNING id
  `.then((r) => { createdInventoryId = r[0].id; });

  await sql`
    INSERT INTO custody (inventory_id, item, code, holder, holder_email, department, checkout, expected, value, status, acceptance_status)
    VALUES (${createdInventoryId}, 'TEST-Accept Duplicate', 'TEST-ACC-003', 'Teste', 'teste@test.com', 'Teste', '2026-07-01', '2026-08-01', 50, 'active', 'completed')
    RETURNING id
  `.then((r) => { createdCustodyId = r[0].id; });

  const { status, data } = await api('POST', `/api/acceptance/${createdCustodyId}/send-token`, { token });
  assert.equal(status, 409);
  assert.match(data.error, /já foi aceito/);
});

test('POST /api/acceptance/:id/verify rejects missing token', async () => {
  const token = await adminToken();

  await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value)
    VALUES ('TEST-Accept Verify', 'TEST-ACC-004', 'Teste', 'Teste', 1, 0, 50)
    RETURNING id
  `.then((r) => { createdInventoryId = r[0].id; });

  await sql`
    INSERT INTO custody (inventory_id, item, code, holder, holder_email, department, checkout, expected, value, status)
    VALUES (${createdInventoryId}, 'TEST-Accept Verify', 'TEST-ACC-004', 'Teste', 'teste@test.com', 'Teste', '2026-07-01', '2026-08-01', 50, 'active')
    RETURNING id
  `.then((r) => { createdCustodyId = r[0].id; });

  const { status, data } = await api('POST', `/api/acceptance/${createdCustodyId}/verify`, { token, body: {} });
  assert.equal(status, 400);
  assert.match(data.error, /Token/);

  const { status: s2, data: d2 } = await api('POST', `/api/acceptance/${createdCustodyId}/verify`, { token, body: { token: '' } });
  assert.equal(s2, 400);
});

test('POST /api/acceptance/:id/verify with invalid token returns 401 and logs audit', async () => {
  const token = await adminToken();

  await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value)
    VALUES ('TEST-Accept Invalid', 'TEST-ACC-005', 'Teste', 'Teste', 1, 0, 50)
    RETURNING id
  `.then((r) => { createdInventoryId = r[0].id; });

  await sql`
    INSERT INTO custody (inventory_id, item, code, holder, holder_email, department, checkout, expected, value, status)
    VALUES (${createdInventoryId}, 'TEST-Accept Invalid', 'TEST-ACC-005', 'Teste', 'teste@test.com', 'Teste', '2026-07-01', '2026-08-01', 50, 'active')
    RETURNING id
  `.then((r) => { createdCustodyId = r[0].id; });

  const { status } = await api('POST', `/api/acceptance/${createdCustodyId}/verify`, { token, body: { token: 'invalid-token-value' } });
  assert.equal(status, 401);

  const audit = await sql`SELECT * FROM audit_trail WHERE custody_id = ${createdCustodyId} AND event = 'token_rejected'`;
  assert.equal(audit.length, 1);
});
