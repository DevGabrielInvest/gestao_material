import test from 'node:test';
import assert from 'node:assert/strict';

const { detectBrowser } = await import('../server/routes/acceptance.js');

test('detectBrowser returns unknown for null/undefined UA', () => {
  assert.deepEqual(detectBrowser(null), { browser: 'Desconhecido', os: 'Desconhecido' });
  assert.deepEqual(detectBrowser(undefined), { browser: 'Desconhecido', os: 'Desconhecido' });
  assert.deepEqual(detectBrowser(''), { browser: 'Desconhecido', os: 'Desconhecido' });
});

test('detectBrowser identifies Chrome on Windows 10', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Chrome');
  assert.equal(result.os, 'Windows 10');
});

test('detectBrowser identifies Firefox on macOS', () => {
  const ua = 'Mozilla/5.0 (Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Firefox');
  assert.equal(result.os, 'macOS');
});

test('detectBrowser identifies Safari on iOS', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Safari');
  assert.equal(result.os, 'iOS');
});

test('detectBrowser identifies Edge on Windows 11', () => {
  const ua = 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 Edg/120.0.0.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Edge');
  assert.equal(result.os, 'Windows 11');
});

test('detectBrowser identifies Opera on Linux', () => {
  const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 OPR/100.0.0.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Opera');
  assert.equal(result.os, 'Linux');
});

test('detectBrowser identifies Internet Explorer on Windows 7', () => {
  const ua = 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Internet Explorer');
  assert.equal(result.os, 'Windows 7');
});

test('detectBrowser identifies Chrome on Android', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Chrome');
  assert.equal(result.os, 'Android');
});

test('detectBrowser prefers Chrome over Safari when both present', () => {
  const ua = 'Mozilla/5.0 Safari/605.1 Chrome/120.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Chrome');
});

test('detectBrowser falls back to Desconhecido for unrecognized UAs', () => {
  const ua = 'SomeRandomApp/1.0';
  const result = detectBrowser(ua);
  assert.equal(result.browser, 'Desconhecido');
  assert.equal(result.os, 'Desconhecido');
});
