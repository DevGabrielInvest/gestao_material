import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken } from './helper.js';

test.before(startServer);
test.after(stopServer);

test('POST /api/events/token requires auth', async () => {
  const { status } = await api('POST', '/api/events/token');
  assert.equal(status, 401);
});

test('POST /api/events/token returns SSE token for authenticated user', async () => {
  const token = await adminToken();
  const { status, data } = await api('POST', '/api/events/token', { token });
  assert.equal(status, 200);
  assert.equal(typeof data.token, 'string');
  assert.ok(data.token.length > 20);
});

test('POST /api/events/token works for requester role too', async () => {
  const token = await requesterToken();
  const { status, data } = await api('POST', '/api/events/token', { token });
  assert.equal(status, 200);
  assert.equal(typeof data.token, 'string');
});

test('GET /api/events without sid param returns 401', async () => {
  const { status, data } = await api('GET', '/api/events');
  assert.equal(status, 401);
  assert.match(data.error, /Token/);
});

test('GET /api/events with invalid sid returns 401', async () => {
  const { status, data } = await api('GET', '/api/events?sid=invalidtoken');
  assert.equal(status, 401);
  assert.match(data.error, /Token/);
});

test('GET /api/events rejects access token as SSE token', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', `/api/events?sid=${token}`);
  assert.equal(status, 401);
  assert.match(data.error, /Tipo de token/);
});
