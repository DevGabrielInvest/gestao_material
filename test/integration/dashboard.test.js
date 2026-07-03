import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken } from './helper.js';

test.before(startServer);
test.after(stopServer);

test('GET /api/dashboard returns stats', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/dashboard', { token });
  assert.equal(status, 200);
  assert.equal(typeof data.inventoryCount, 'number');
  assert.equal(typeof data.categories, 'number');
  assert.equal(typeof data.lowStock, 'number');
  assert.equal(typeof data.activeCustody, 'number');
  assert.equal(typeof data.custodyValue, 'number');
  assert.equal(typeof data.pendingRequests, 'number');
  assert.equal(Array.isArray(data.charts.categoryDistribution), true);
  assert.equal(Array.isArray(data.charts.movementsByMonth), true);
  assert.equal(typeof data.charts.requestStatus, 'object');
});

test('GET /api/dashboard without auth returns 401', async () => {
  const { status } = await api('GET', '/api/dashboard');
  assert.equal(status, 401);
});

test('GET /api/activity returns paginated activity log', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/activity', { token });
  assert.equal(status, 200);
  assert.equal(Array.isArray(data.data), true);
  assert.equal(typeof data.total, 'number');
  assert.equal(typeof data.hasMore, 'boolean');
  assert.equal(data.limit > 0, true);
});
