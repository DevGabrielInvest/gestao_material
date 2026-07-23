import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const utilsSrc = fs.readFileSync(new URL('../public/utils.js', import.meta.url), 'utf-8');
const apiSrc = fs.readFileSync(new URL('../public/api.js', import.meta.url), 'utf-8');

const dom = new JSDOM(
  '<!DOCTYPE html><html><body></body></html>',
  { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: false },
);

const toVar = (src) => src.replace(/^(const|let) /gm, 'var ');

const s1 = dom.window.document.createElement('script');
s1.textContent = toVar(utilsSrc);
dom.window.document.body.appendChild(s1);

// api.js references endSession which is defined in app.js
dom.window.endSession = () => { dom.window.clearToken(); };

const s2 = dom.window.document.createElement('script');
s2.textContent = toVar(apiSrc);
dom.window.document.body.appendChild(s2);

const { api, apiGet, apiPost, apiPut, apiDelete, debounce } = dom.window;

function mockResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    headers: { get: () => null },
  };
}

test('debounce delays function execution', async () => {
  let callCount = 0;
  const fn = debounce(() => { callCount++; }, 100);

  fn();
  fn();
  fn();

  assert.equal(callCount, 0);
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(callCount, 1);
});

test('api GET without auth token returns JSON data', async () => {
  dom.window.fetch = async () => mockResponse({ data: ['item'] });

  const data = await api('GET', '/api/inventory');
  assert.deepEqual(data, { data: ['item'] });
});

test('api sends auth token from sessionStorage', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'test-token-123');
  let capturedHeaders;
  dom.window.fetch = async (url, opts) => {
    capturedHeaders = opts.headers;
    return mockResponse({ data: [] });
  };

  await api('GET', '/api/inventory');
  assert.equal(capturedHeaders.Authorization, 'Bearer test-token-123');
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('apiPost sends JSON body', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'tok');
  let capturedBody;
  dom.window.fetch = async (url, opts) => {
    capturedBody = opts.body;
    return mockResponse({ id: 1 });
  };

  await apiPost('/api/inventory', { name: 'Test' });
  assert.equal(JSON.parse(capturedBody).name, 'Test');
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('api handles network error gracefully', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'tok');
  dom.window.fetch = async () => { throw new dom.window.TypeError('Failed to fetch'); };

  await assert.rejects(
    () => api('GET', '/api/test'),
    (err) => err.message.includes('Sem conexão'),
  );
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('api retries on 5xx errors', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'tok');
  let callCount = 0;
  dom.window.fetch = async () => {
    callCount++;
    return mockResponse({ error: 'Server error' }, 500);
  };

  await assert.rejects(() => api('GET', '/api/test'));
  assert.equal(callCount, 3);
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('apiPut sends PUT request', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'tok');
  let capturedMethod;
  dom.window.fetch = async (url, opts) => {
    capturedMethod = opts.method;
    return mockResponse({ ok: true });
  };

  await apiPut('/api/inventory/1', { name: 'Updated' });
  assert.equal(capturedMethod, 'PUT');
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('apiDelete sends DELETE request', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'tok');
  let capturedMethod;
  dom.window.fetch = async (url, opts) => {
    capturedMethod = opts.method;
    return mockResponse({ ok: true });
  };

  await apiDelete('/api/inventory/1');
  assert.equal(capturedMethod, 'DELETE');
  dom.window.sessionStorage.removeItem('dfa-token-v2');
});

test('api throws on 401 without viable refresh', async () => {
  dom.window.sessionStorage.setItem('dfa-token-v2', 'expired');
  dom.window.sessionStorage.setItem('dfa-refresh-v2', 'bad-refresh');
  dom.window.fetch = async (url) => {
    if (url.includes('/auth/refresh')) {
      return mockResponse({ error: 'bad' }, 401);
    }
    return mockResponse({ error: 'unauthorized' }, 401);
  };

  await assert.rejects(() => api('GET', '/api/inventory'), /sessão expirou/);
  assert.equal(dom.window.sessionStorage.getItem('dfa-token-v2'), null);
  dom.window.sessionStorage.removeItem('dfa-refresh-v2');
});
