import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_AUDIENCE, JWT_ISSUER } from '../server/config.js';
import { authMiddleware, roleMiddleware } from '../server/middleware.js';

function makeReqRes(headers = {}) {
  const req = { headers: { authorization: headers.authorization || '' }, user: null };
  let statusCode;
  let jsonBody;
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (body) => { jsonBody = body; return res; },
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, getStatus: () => statusCode, getJson: () => jsonBody, wasNextCalled: () => nextCalled };
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    audience: JWT_AUDIENCE.access,
    issuer: JWT_ISSUER,
  });
}

test('authMiddleware rejects missing Authorization header', () => {
  const { req, res, next, getStatus, getJson } = makeReqRes({});
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /Token/);
});

test('authMiddleware rejects non-Bearer Authorization header', () => {
  const { req, res, next, getStatus } = makeReqRes({ authorization: 'Basic xyz' });
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
});

test('authMiddleware rejects invalid token', () => {
  const { req, res, next, getStatus, getJson } = makeReqRes({ authorization: 'Bearer invalid.jwt.token' });
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /Token/);
});

test('authMiddleware rejects refresh type token', () => {
  const refreshToken = jwt.sign(
    { type: 'refresh', id: 1, role: 'admin', name: 'Admin' },
    JWT_SECRET,
    { algorithm: 'HS256', audience: JWT_AUDIENCE.access, issuer: JWT_ISSUER },
  );
  const { req, res, next, getStatus, getJson } = makeReqRes({ authorization: `Bearer ${refreshToken}` });
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /Tipo de token inválido/);
});

test('authMiddleware rejects token with wrong audience', () => {
  const wrongAudToken = jwt.sign(
    { type: 'access', id: 1, role: 'admin', name: 'Admin' },
    JWT_SECRET,
    { algorithm: 'HS256', audience: 'wrong-audience', issuer: JWT_ISSUER },
  );
  const { req, res, next, getStatus } = makeReqRes({ authorization: `Bearer ${wrongAudToken}` });
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
});

test('authMiddleware accepts valid access token', () => {
  const token = signToken({ type: 'access', id: 1, name: 'Admin', role: 'admin', email: 'admin@test.com' });
  const { req, res, next, wasNextCalled } = makeReqRes({ authorization: `Bearer ${token}` });
  authMiddleware(req, res, next);
  assert.equal(wasNextCalled(), true);
  assert.equal(req.user.role, 'admin');
  assert.equal(req.user.id, 1);
  assert.equal(req.user.email, 'admin@test.com');
});

test('authMiddleware rejects token signed with different secret', () => {
  const token = jwt.sign(
    { type: 'access', id: 1, role: 'admin' },
    'different-secret-that-is-also-long-enough-for-testing',
    { algorithm: 'HS256', audience: JWT_AUDIENCE.access, issuer: JWT_ISSUER },
  );
  const { req, res, next, getStatus } = makeReqRes({ authorization: `Bearer ${token}` });
  authMiddleware(req, res, next);
  assert.equal(getStatus(), 401);
});

test('roleMiddleware allows matching role', () => {
  const req = { user: { role: 'admin' } };
  let nextCalled = false;
  const res = { status: () => res, json: () => {} };
  roleMiddleware('admin', 'manager')(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test('roleMiddleware rejects insufficient role', () => {
  const req = { user: { role: 'requester' } };
  let statusCode;
  let jsonBody;
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (body) => { jsonBody = body; return res; },
  };
  roleMiddleware('admin', 'manager')(req, res, () => {});
  assert.equal(statusCode, 403);
  assert.match(jsonBody.error, /Permissão/);
});

test('roleMiddleware accepts any of multiple roles', () => {
  const req = { user: { role: 'viewer' } };
  let nextCalled = false;
  const res = { status: () => res, json: () => {} };
  roleMiddleware('admin', 'manager', 'viewer')(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
