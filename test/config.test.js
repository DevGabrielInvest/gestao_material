import test from 'node:test';
import assert from 'node:assert/strict';

test('config exports expected constants', async () => {
  const config = await import('../server/config.js');
  assert.equal(typeof config.JWT_SECRET, 'string');
  assert.equal(typeof config.PORT, 'number');
  assert.equal(typeof config.RATE_LIMIT, 'object');
  assert.equal(typeof config.HELMET_CONFIG, 'object');
  assert.equal(config.JWT_ISSUER, 'gestao-patrimonial');
  assert.equal(config.JWT_AUDIENCE.access, 'gestao-patrimonial:access');
  assert.equal(config.JWT_AUDIENCE.refresh, 'gestao-patrimonial:refresh');
  assert.ok(config.VALID_ROLES.includes('admin'));
  assert.ok(config.VALID_ROLES.includes('requester'));
  assert.ok(config.VALID_MOVEMENT_TYPES.includes('entry'));
  assert.ok(config.VALID_MOVEMENT_TYPES.includes('exit'));
});

test('config pagination limits are positive numbers', async () => {
  const config = await import('../server/config.js');
  for (const [key, val] of Object.entries(config.PAGINATION)) {
    assert.equal(typeof val.defaultLimit, 'number', `${key}.defaultLimit`);
    assert.equal(typeof val.maxLimit, 'number', `${key}.maxLimit`);
    assert.ok(val.defaultLimit > 0, `${key}.defaultLimit > 0`);
    assert.ok(val.maxLimit >= val.defaultLimit, `${key}.maxLimit >= defaultLimit`);
  }
});

test('config has valid regex patterns', async () => {
  const config = await import('../server/config.js');
  assert.ok(config.EMAIL_REGEX.test('user@example.com'));
  assert.ok(!config.EMAIL_REGEX.test('invalid'));
  assert.ok(config.DATE_REGEX.test('2026-07-23'));
  assert.ok(!config.DATE_REGEX.test('2026/07/23'));
});

test('config JWT constants are properly defined', async () => {
  const config = await import('../server/config.js');
  assert.equal(config.JWT_EXPIRY, '24h');
  assert.equal(config.REFRESH_TOKEN_EXPIRY, '7d');
  assert.ok(config.REFRESH_TOKEN_TTL_DAYS >= 1);
  assert.ok(config.SSE_TOKEN_EXPIRY.includes('s'));
  assert.deepEqual(config.JWT_ALGORITHMS, ['HS256']);
});

test('config validation limits are defined', async () => {
  const config = await import('../server/config.js');
  assert.ok(config.VALIDATION_LIMITS.string.defaultMax > 0);
  assert.ok(config.VALIDATION_LIMITS.number.maxInteger > 0);
  assert.ok(config.VALIDATION_LIMITS.number.maxCurrency > 0);
});

test('config EMAIL_CONFIG has defaults', async () => {
  const config = await import('../server/config.js');
  assert.equal(typeof config.EMAIL_CONFIG.from, 'string');
  assert.equal(typeof config.ACCEPTANCE_TOKEN_EXPIRY_MINUTES, 'number');
  assert.equal(typeof config.STATIC_MAX_AGE_MS, 'number');
  assert.equal(typeof config.BASE_URL, 'string');
  assert.equal(typeof config.NODE_ENV, 'string');
  assert.equal(typeof config.DATABASE_URL, 'string');
  assert.equal(typeof config.DB_CONFIG, 'object');
});

test('config status and priority constants are defined', async () => {
  const config = await import('../server/config.js');
  assert.ok(config.VALID_REQUEST_STATUS.includes('pending'));
  assert.ok(config.VALID_REQUEST_STATUS.includes('approved'));
  assert.ok(config.VALID_REQUEST_STATUS.includes('delivered'));
  assert.ok(config.VALID_REQUEST_STATUS.includes('rejected'));
  assert.ok(config.VALID_CUSTODY_STATUS.includes('active'));
  assert.ok(config.VALID_CUSTODY_STATUS.includes('returned'));
  assert.ok(config.VALID_PRIORITIES.includes('Normal'));
  assert.ok(config.VALID_PRIORITIES.includes('Alta'));
  assert.ok(config.VALID_PRIORITIES.includes('Urgente'));
});

test('config security constants are positive numbers', async () => {
  const config = await import('../server/config.js');
  assert.ok(config.PASSWORD_MIN_LENGTH >= 4);
  assert.ok(config.ACTIVITY_RETENTION_DAYS >= 30);
});
