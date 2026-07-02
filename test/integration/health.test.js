import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, getBaseUrl, api } from './helper.js';

test.before(startServer);
test.after(stopServer);

test('GET /api/health returns healthy status', async () => {
  const { status, data } = await api('GET', '/api/health');
  assert.equal(status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.status, 'healthy');
  assert.match(data.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(typeof data.uptime, 'number');
});
