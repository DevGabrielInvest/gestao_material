import test from 'node:test';
import assert from 'node:assert/strict';
import { getCached, setCache, invalidateCache } from '../server/cache.js';

test.afterEach(() => invalidateCache());

test('setCache and getCached store and retrieve a value', () => {
  setCache('key1', { data: 42 });
  assert.deepEqual(getCached('key1'), { data: 42 });
});

test('getCached returns null for missing key', () => {
  assert.equal(getCached('nonexistent'), null);
});

test('getCached returns null for expired entry', async () => {
  setCache('key2', 'value', 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(getCached('key2'), null);
});

test('setCache with custom TTL', async () => {
  setCache('key3', 'persistent', 10_000);
  assert.equal(getCached('key3'), 'persistent');
});

test('invalidateCache clears all entries', () => {
  setCache('a:1', 'x');
  setCache('a:2', 'y');
  setCache('b:1', 'z');
  invalidateCache();
  assert.equal(getCached('a:1'), null);
  assert.equal(getCached('a:2'), null);
  assert.equal(getCached('b:1'), null);
});

test('invalidateCache clears entries matching prefix', () => {
  setCache('user:1', 'alice');
  setCache('user:2', 'bob');
  setCache('dashboard:v1', 'data');
  invalidateCache('user:');
  assert.equal(getCached('user:1'), null);
  assert.equal(getCached('user:2'), null);
  assert.equal(getCached('dashboard:v1'), 'data');
});

test('invalidateCache with non-matching prefix keeps all entries', () => {
  setCache('x', 1);
  setCache('y', 2);
  invalidateCache('z:');
  assert.equal(getCached('x'), 1);
  assert.equal(getCached('y'), 2);
});
