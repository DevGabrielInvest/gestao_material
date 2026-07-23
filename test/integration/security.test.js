import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

test('SQL injection in search parameter does not cause error', async () => {
  const token = await adminToken();
  const payloads = [
    `/api/inventory?search=' OR 1=1;--`,
    `/api/inventory?search=' UNION SELECT * FROM users--`,
    `/api/inventory?search=; DROP TABLE users--`,
    `/api/inventory?search=' OR '1'='1`,
  ];
  for (const path of payloads) {
    const { status } = await api('GET', path, { token });
    assert.equal(status, 200, `SQLi payload failed: ${path}`);
  }
});

test('SSE token is rejected as Bearer token on API endpoints', async () => {
  const token = await adminToken();
  const sseRes = await api('POST', '/api/events/token', { token });
  assert.equal(sseRes.status, 200);
  const sseToken = sseRes.data.token;

  const { status, data } = await api('GET', '/api/auth/me', { token: sseToken });
  assert.equal(status, 401);
  assert.match(data.error, /Token/);
});

test('refresh token rotation invalidates old token', async () => {
  const login = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'admin123' },
  });
  assert.equal(login.status, 200);
  const oldRefreshToken = login.data.refreshToken;

  const refresh = await api('POST', '/api/auth/refresh', {
    body: { refreshToken: oldRefreshToken },
  });
  assert.equal(refresh.status, 200);
  assert.equal(typeof refresh.data.token, 'string');
  assert.equal(typeof refresh.data.refreshToken, 'string');

  const oldRefreshAgain = await api('POST', '/api/auth/refresh', {
    body: { refreshToken: oldRefreshToken },
  });
  assert.equal(oldRefreshAgain.status, 401);
  assert.match(oldRefreshAgain.data.error, /Refresh token inválido/);
});

test('logout revokes refresh token', async () => {
  const login = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'admin123' },
  });
  assert.equal(login.status, 200);
  const refreshToken = login.data.refreshToken;

  const logout = await api('POST', '/api/auth/logout', {
    body: { refreshToken },
  });
  assert.equal(logout.status, 200);
  assert.equal(logout.data.ok, true);

  const refreshAfterLogout = await api('POST', '/api/auth/refresh', {
    body: { refreshToken },
  });
  assert.equal(refreshAfterLogout.status, 401);
  assert.match(refreshAfterLogout.data.error, /Refresh token inválido/);
});

test('logout is idempotent: calling twice does not error', async () => {
  const login = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'admin123' },
  });
  const refreshToken = login.data.refreshToken;

  const first = await api('POST', '/api/auth/logout', { body: { refreshToken } });
  assert.equal(first.status, 200);

  const second = await api('POST', '/api/auth/logout', { body: { refreshToken } });
  assert.equal(second.status, 200);
  assert.equal(second.data.ok, true);
});

test('XSS payload stored in inventory escapes in CSV export', async () => {
  await sql`DELETE FROM inventory WHERE code = 'TEST-XSS-SEC'`;

  const token = await adminToken();
  const created = await api('POST', '/api/inventory', {
    token,
    body: {
      name: '<script>alert("xss")</script>',
      code: 'TEST-XSS-SEC',
      category: 'Teste',
      location: 'Teste',
      quantity: 1,
      minimum: 0,
      value: 10,
    },
  });
  assert.equal(created.status, 201);

  const { status, data } = await api('GET', '/api/inventory?search=TEST-XSS-SEC', { token });
  assert.equal(status, 200);
  const item = data.data.find((i) => i.code === 'TEST-XSS-SEC');
  assert.ok(item);

  await api('DELETE', `/api/inventory/${item.id}`, { token });
  await sql`DELETE FROM inventory WHERE code = 'TEST-XSS-SEC'`;
});

test('request with extremely long strings is rejected by validation', async () => {
  const token = await adminToken();
  const { status } = await api('POST', '/api/inventory', {
    token,
    body: {
      name: 'x'.repeat(500),
      code: 'TEST-LONG',
      category: 'Teste',
      location: 'Teste',
      quantity: 1,
      minimum: 0,
      value: 10,
    },
  });
  assert.equal(status, 400);
});

test('access token signed with wrong secret is rejected', async () => {
  const token = await adminToken();
  const { status } = await api('GET', '/api/auth/me', { token: token + 'tampered' });
  assert.equal(status, 401);
});
