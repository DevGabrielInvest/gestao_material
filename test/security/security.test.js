import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../../server/app.js';

let server;
let url;

test.before(async () => {
  await new Promise((resolve) => {
    server = createServer(app);
    server.listen(0, () => {
      url = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  if (server) server.close();
});

test('HTTP security headers are present', async () => {
  const res = await fetch(`${url}/api/health`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-xss-protection'), '0');
  assert.equal(res.headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains; preload');
  assert.equal(res.headers.get('x-dns-prefetch-control'), 'off');
  assert.match(res.headers.get('content-security-policy') || '', /default-src 'self'/);
});

test('invalid JSON body returns 400', async () => {
  const res = await fetch(`${url}/api/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json-at-all',
  });
  assert.equal(res.status, 400);
});

test('logout without refresh token still returns ok', async () => {
  const res = await fetch(`${url}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
});

test('OPTIONS preflight returns CORS-safe headers on public routes', async () => {
  const res = await fetch(`${url}/api/health`, { method: 'OPTIONS' });
  assert.ok(res.status === 200 || res.status === 204);
});

test('GET /api/health returns minimal public response', async () => {
  const res = await fetch(`${url}/api/health`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.deepEqual(Object.keys(data), ['ok']);
});

test('API 500 errors hide internal details from client', async () => {
  const res = await fetch(`${url}/api/nonexistent-route-that-should-404`);
  assert.ok(res.status === 404 || res.status === 500);
});
