import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer, api, adminToken, requesterToken, getBaseUrl, sql } from './helper.js';

test.before(startServer);
test.after(stopServer);

test.afterEach(async () => {
  await sql`DELETE FROM inventory WHERE code = 'TEST-FORMULA'`;
});

async function downloadCsv(path, token) {
  const res = await fetch(`${getBaseUrl()}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, contentType: res.headers.get('content-type'), disposition: res.headers.get('content-disposition'), body: await res.text() };
}

test('GET /api/reports/summary returns full aggregates', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/reports/summary', { token });
  assert.equal(status, 200);
  assert.equal(typeof data.totals.inventoryCount, 'number');
  assert.equal(typeof data.totals.inventoryValue, 'number');
  assert.equal(typeof data.totals.custodyCount, 'number');
  assert.equal(typeof data.totals.custodyValue, 'number');
  assert.equal(typeof data.totals.pendingRequests, 'number');
  assert.equal(typeof data.totals.lowStock, 'number');
  assert.equal(typeof data.totals.consumed, 'number');
  assert.equal(Array.isArray(data.consumption), true);
  assert.equal(Array.isArray(data.holders), true);
  assert.equal(Array.isArray(data.activeCustody), true);
  assert.equal(Array.isArray(data.inventory), true);
  assert.equal(data.inventory.length, data.totals.inventoryCount);
});

test('GET /api/reports/summary respects period filter', async () => {
  const token = await adminToken();
  const { status, data } = await api('GET', '/api/reports/summary?dateFrom=2099-01-01&dateTo=2099-12-31', { token });
  assert.equal(status, 200);
  assert.equal(data.totals.consumed, 0);
  assert.equal(data.consumption.length, 0);
});

test('GET /api/reports/summary rejects invalid dates', async () => {
  const token = await adminToken();
  const { status } = await api('GET', '/api/reports/summary?dateFrom=abc', { token });
  assert.equal(status, 400);
});

test('GET /api/reports/summary without auth returns 401', async () => {
  const { status } = await api('GET', '/api/reports/summary');
  assert.equal(status, 401);
});

test('GET /api/reports/summary rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('GET', '/api/reports/summary', { token });
  assert.equal(status, 403);
});

test('GET /api/reports/inventory-csv downloads CSV with all items', async () => {
  const token = await adminToken();
  const { status, contentType, disposition, body } = await downloadCsv('/api/reports/inventory-csv', token);
  assert.equal(status, 200);
  assert.match(contentType, /text\/csv/);
  assert.match(disposition, /attachment; filename="inventario-/);
  assert.match(body, /Nome,Código,Categoria/);
  const { data } = await api('GET', '/api/reports/summary', { token });
  const lines = body.trim().split('\n');
  assert.equal(lines.length - 1, data.totals.inventoryCount);
});

test('GET /api/reports/inventory-csv neutralizes spreadsheet formulas', async () => {
  await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value)
    VALUES ('=HYPERLINK("https://example.com","x")', 'TEST-FORMULA', 'Teste', 'Teste', 1, 0, 0)
  `;
  const token = await adminToken();
  const { status, body } = await downloadCsv('/api/reports/inventory-csv', token);
  assert.equal(status, 200);
  assert.match(body, /'=HYPERLINK/);
});

test('GET /api/reports/movements-csv downloads CSV with headers', async () => {
  const token = await adminToken();
  const { status, contentType, body } = await downloadCsv('/api/reports/movements-csv', token);
  assert.equal(status, 200);
  assert.match(contentType, /text\/csv/);
  assert.match(body, /Data;Tipo;Centro de custo/);
});

test('GET /api/reports/movements-csv accepts filters', async () => {
  const token = await adminToken();
  const { status } = await downloadCsv('/api/reports/movements-csv?type=exit&dateFrom=2020-01-01&dateTo=2099-12-31&search=teste', token);
  assert.equal(status, 200);
});

test('GET /api/reports/financial-csv downloads CSV with headers', async () => {
  const token = await adminToken();
  const { status, contentType, body } = await downloadCsv('/api/reports/financial-csv', token);
  assert.equal(status, 200);
  assert.match(contentType, /text\/csv/);
  assert.match(body, /Tipo;Data;Centro de custo \/ setor/);
});

test('CSV endpoints reject requester role', async () => {
  const token = await requesterToken();
  for (const path of ['/api/reports/inventory-csv', '/api/reports/movements-csv', '/api/reports/financial-csv']) {
    const { status } = await downloadCsv(path, token);
    assert.equal(status, 403, path);
  }
});

test('GET /api/reports/pdf rejects requester role', async () => {
  const token = await requesterToken();
  const { status } = await api('GET', '/api/reports/pdf', { token });
  assert.equal(status, 403);
});
