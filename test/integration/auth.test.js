import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken } from './helper.js';

test.before(startServer);
test.after(stopServer);

test('POST /api/auth/login with valid credentials returns token and user', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'admin123' },
  });
  assert.equal(status, 200);
  assert.equal(typeof data.token, 'string');
  assert.equal(data.user.email, 'admin@dfa.com');
  assert.equal(data.user.role, 'admin');
  assert.equal(data.user.name, 'Administração DFA');
});

test('POST /api/auth/login with invalid password returns 401', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'wrongpassword' },
  });
  assert.equal(status, 401);
  assert.equal(typeof data.error, 'string');
});

test('POST /api/auth/login with invalid email returns 401', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'nonexistent@dfa.com', password: 'admin123' },
  });
  assert.equal(status, 401);
  assert.equal(typeof data.error, 'string');
});

test('POST /api/auth/login with invalid email format returns 400', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'invalid-email', password: 'admin123' },
  });
  assert.equal(status, 400);
  assert(data.error.includes('E-mail'));
});

test('POST /api/auth/login with short password returns 400', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'admin@dfa.com', password: 'short' },
  });
  assert.equal(status, 400);
  assert(data.error.includes('Senha'));
});

test('GET /api/auth/me with valid token returns user', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/auth/me', { token });
  assert.equal(status, 200);
  assert.equal(data.email, 'admin@dfa.com');
  assert.equal(data.role, 'admin');
});

test('GET /api/auth/me without token returns 401', async () => {
  const { status, data } = await api('GET', '/api/auth/me');
  assert.equal(status, 401);
  assert(data.error.includes('Token'));
});

test('GET /api/auth/me with invalid token returns 401', async () => {
  const { status, data } = await api('GET', '/api/auth/me', {
    token: 'invalid-token',
  });
  assert.equal(status, 401);
  assert(data.error.includes('Token'));
});
