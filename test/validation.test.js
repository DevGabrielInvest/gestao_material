import test from 'node:test';
import assert from 'node:assert/strict';

const {
  validateString,
  validateNumber,
  validateEnum,
  validateEmail,
  validateDate,
  optionalQueryString,
  optionalQueryDate,
  optionalQueryEnum,
  parsePositiveId,
  validateInventoryBody,
  todayLocal,
  INVALID_QUERY,
} = await import('../server/validation.js');

test('validateString rejects empty / non-string values', () => {
  assert.ok(validateString(''));
  assert.ok(validateString('   '));
  assert.ok(validateString(null));
  assert.ok(validateString(undefined));
  assert.ok(validateString(123));
});

test('validateString rejects exceeding max length', () => {
  assert.ok(validateString('a'.repeat(256), 255));
  assert.equal(validateString('abc', 255), null);
});

test('validateString returns null for valid input', () => {
  assert.equal(validateString('Notebook Dell'), null);
  assert.equal(validateString('a', 1), null);
});

test('validateNumber rejects non-numeric values', () => {
  assert.ok(validateNumber('', 0));
  assert.ok(validateNumber(null, 0));
  assert.ok(validateNumber('abc', 0));
  assert.ok(validateNumber(NaN, 0));
});

test('validateNumber enforces integer constraint', () => {
  assert.ok(validateNumber(5.5, 0, { integer: true }));
  assert.equal(validateNumber(5, 0, { integer: true }), null);
});

test('validateNumber enforces min and max', () => {
  assert.ok(validateNumber(-1, 0));
  assert.equal(validateNumber(10, 0), null);
  assert.ok(validateNumber(101, 0, { max: 100 }));
});

test('validateEnum accepts valid values', () => {
  assert.equal(validateEnum('admin', ['admin', 'manager']), null);
  assert.equal(validateEnum('entry', ['entry', 'exit']), null);
});

test('validateEnum rejects invalid values', () => {
  assert.ok(validateEnum('superadmin', ['admin', 'manager']));
  assert.ok(validateEnum('delete', ['entry', 'exit']));
});

test('validateEmail accepts valid emails', () => {
  assert.equal(validateEmail('user@example.com'), null);
  assert.equal(validateEmail('a.b@c.co'), null);
});

test('validateEmail rejects invalid emails', () => {
  assert.ok(validateEmail(''));
  assert.ok(validateEmail('not-an-email'));
  assert.ok(validateEmail('@domain.com'));
  assert.ok(validateEmail('user@'));
});

test('validateDate accepts valid ISO dates', () => {
  assert.equal(validateDate('2026-07-23'), null);
  assert.equal(validateDate('2024-02-29'), null);
});

test('validateDate rejects invalid dates', () => {
  assert.ok(validateDate(''));
  assert.ok(validateDate('2026/07/23'));
  assert.ok(validateDate('23-07-2026'));
  assert.ok(validateDate('2026-13-01'));
  assert.ok(validateDate('2026-02-31'));
  assert.ok(validateDate('abc'));
});

test('optionalQueryString returns empty for missing param', () => {
  const req = { query: {} };
  const res = {};
  assert.equal(optionalQueryString(req, res, 'search'), '');
});

test('optionalQueryString returns trimmed value', () => {
  const req = { query: { name: '  Notebook  ' } };
  const res = {};
  assert.equal(optionalQueryString(req, res, 'name'), 'Notebook');
});

test('optionalQueryString rejects array values', () => {
  const req = { query: { ids: ['a', 'b'] } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryString(req, res, 'ids'), INVALID_QUERY);
});

test('optionalQueryString rejects exceeding maxLen', () => {
  const req = { query: { q: 'a'.repeat(300) } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryString(req, res, 'q', 120), INVALID_QUERY);
});

test('optionalQueryDate validates date format', () => {
  const req = { query: { date: '2026-07-23' } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryDate(req, res, 'date'), '2026-07-23');
});

test('optionalQueryDate rejects invalid date', () => {
  const req = { query: { date: 'abc' } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryDate(req, res, 'date'), INVALID_QUERY);
});

test('optionalQueryEnum validates enum values', () => {
  const req = { query: { type: 'entry' } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryEnum(req, res, 'type', ['entry', 'exit']), 'entry');
});

test('optionalQueryEnum rejects invalid enum', () => {
  const req = { query: { type: 'delete' } };
  const res = { status: () => res, json: () => {} };
  assert.equal(optionalQueryEnum(req, res, 'type', ['entry', 'exit']), INVALID_QUERY);
});

test('parsePositiveId returns number for valid ID', () => {
  const req = { params: { id: '42' } };
  const res = { status: () => res, json: () => {} };
  assert.equal(parsePositiveId(req, res), 42);
});

test('parsePositiveId rejects zero and negative', () => {
  for (const id of ['0', '-1', 'abc', '1.5']) {
    const req = { params: { id } };
    let statusCode;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: () => {},
    };
    assert.equal(parsePositiveId(req, res), null);
    assert.equal(statusCode, 400);
  }
});

test('validateInventoryBody validates required fields', () => {
  const req = { body: {} };
  let statusCode; let jsonBody;
  const res = {
    status: (code) => { statusCode = code; return res; },
    json: (body) => { jsonBody = body; return res; },
  };
  const result = validateInventoryBody(req, res);
  assert.equal(statusCode, 400);
  assert.match(jsonBody.error, /name:/);
});

test('validateInventoryBody rejects missing code', () => {
  const req = { body: { name: 'Item', category: 'Teste', location: 'Teste' } };
  let statusCode; let jsonBody;
  const res = { status: (c) => { statusCode = c; return res; }, json: (b) => { jsonBody = b; return res; } };
  validateInventoryBody(req, res);
  assert.equal(statusCode, 400);
  assert.match(jsonBody.error, /code:/);
});

test('validateInventoryBody rejects negative quantity', () => {
  const req = { body: { name: 'Item', code: 'C001', category: 'Teste', location: 'Teste', quantity: -1 } };
  let statusCode; let jsonBody;
  const res = { status: (c) => { statusCode = c; return res; }, json: (b) => { jsonBody = b; return res; } };
  validateInventoryBody(req, res);
  assert.equal(statusCode, 400);
});

test('validateDate rejects Feb 31', () => {
  assert.ok(validateDate('2026-02-31'));
});

test('validateDate rejects invalid month 13', () => {
  assert.ok(validateDate('2026-13-01'));
});

test('validateDate rejects day 0', () => {
  assert.ok(validateDate('2026-01-00'));
});

test('validateNumber rejects Infinity', () => {
  assert.ok(validateNumber(Infinity, 0));
});

test('validateNumber rejects negative with integer constraint', () => {
  assert.ok(validateNumber(-5, 0, { integer: true }));
});

test('validateInventoryBody accepts valid body', () => {
  const req = {
    body: {
      name: 'Notebook',
      code: 'NB-001',
      category: 'Informática',
      location: 'Sala 5',
      quantity: 10,
      minimum: 2,
      value: 5000.50,
    },
  };
  const res = {};
  assert.equal(validateInventoryBody(req, res), null);
});

test('todayLocal returns YYYY-MM-DD format', () => {
  const result = todayLocal();
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
});
