import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  INTERNAL_ERROR_MESSAGE,
  handleRouteError,
  logInfo,
  requestIdMiddleware,
  requestLoggingMiddleware,
} from '../server/logger.js';

function createOutput() {
  return {
    lines: [],
    log(line) { this.lines.push({ stream: 'log', line }); },
    warn(line) { this.lines.push({ stream: 'warn', line }); },
    error(line) { this.lines.push({ stream: 'error', line }); },
  };
}

function parseOnlyLine(output) {
  assert.equal(output.lines.length, 1);
  return JSON.parse(output.lines[0].line);
}

test('logInfo writes one structured JSON line', () => {
  const output = createOutput();

  logInfo('server_started', { environment: 'test' }, output);

  const entry = parseOnlyLine(output);
  assert.equal(output.lines[0].stream, 'log');
  assert.equal(entry.level, 'info');
  assert.equal(entry.event, 'server_started');
  assert.equal(entry.environment, 'test');
  assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('requestIdMiddleware reuses x-request-id header and writes response header', () => {
  const headers = {};
  const req = {
    get(name) {
      return name === 'x-request-id' ? 'req-from-client' : undefined;
    },
  };
  const res = {
    setHeader(name, value) {
      headers[name] = value;
    },
  };
  let nextCalled = false;

  requestIdMiddleware(req, res, () => { nextCalled = true; });

  assert.equal(req.requestId, 'req-from-client');
  assert.equal(headers['x-request-id'], 'req-from-client');
  assert.equal(nextCalled, true);
});

test('handleRouteError hides internal error details from the client', () => {
  const output = createOutput();
  const err = new Error('relation "users" does not exist');
  const req = {
    requestId: 'req-500',
    method: 'GET',
    originalUrl: '/api/dashboard',
    user: { id: 7 },
  };
  const res = {
    headersSent: false,
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  handleRouteError(err, req, res, output);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    error: INTERNAL_ERROR_MESSAGE,
    requestId: 'req-500',
  });
  assert.equal(res.body.error.includes('relation'), false);

  const entry = parseOnlyLine(output);
  assert.equal(output.lines[0].stream, 'error');
  assert.equal(entry.event, 'http_route_exception');
  assert.equal(entry.requestId, 'req-500');
  assert.equal(entry.error.message, 'relation "users" does not exist');
});

test('requestLoggingMiddleware logs completed API requests with duration', (t) => {
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => lines.push(line);
  t.after(() => { console.log = originalLog; });

  const req = {
    requestId: 'req-ok',
    method: 'GET',
    originalUrl: '/api/health',
    user: { id: 3 },
  };
  const res = new EventEmitter();
  res.statusCode = 200;
  let nextCalled = false;

  requestLoggingMiddleware(req, res, () => { nextCalled = true; });
  res.emit('finish');

  assert.equal(nextCalled, true);
  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.equal(entry.level, 'info');
  assert.equal(entry.event, 'http_request_completed');
  assert.equal(entry.requestId, 'req-ok');
  assert.equal(entry.statusCode, 200);
  assert.equal(entry.userId, 3);
  assert.equal(typeof entry.durationMs, 'number');
});
