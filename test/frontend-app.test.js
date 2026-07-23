import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const utilsSrc = fs.readFileSync(new URL('../public/utils.js', import.meta.url), 'utf-8');
const appSrc = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf-8');

const html = `
<!DOCTYPE html>
<html>
<body>
<div id="app">
  <div id="sidebar"><nav id="nav"></nav></div>
  <div id="toast"><span id="toastMessage"></span></div>
  <div id="breadcrumb"><span id="breadcrumbTitle"></span></div>
  <div id="modalBackdrop" aria-hidden="true">
    <span id="modalEyebrow"></span>
    <span id="modalTitle"></span>
    <span id="submitModal"></span>
    <span id="cancelModal"></span>
    <div id="modalBody"></div>
    <form id="modalForm"></form>
  </div>
  <canvas id="categoryChart"></canvas>
  <canvas id="movementChart"></canvas>
  <canvas id="requestChart"></canvas>
</div>
</body>
</html>`;

const dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true });

dom.window.fetch = () => Promise.resolve({
  ok: true,
  status: 200,
  json: async () => ({}),
  headers: { get: () => null },
});

// app.js references utils functions and globals
dom.window.currentUser = null;

const toVar = (src) => src.replace(/^(const|let) /gm, 'var ');

const s1 = dom.window.document.createElement('script');
s1.textContent = toVar(utilsSrc);
dom.window.document.body.appendChild(s1);

const s2 = dom.window.document.createElement('script');
s2.textContent = toVar(appSrc);
dom.window.document.body.appendChild(s2);

const { acceptanceStatusBadge, tokenExpiresSoon } = dom.window;

test('acceptanceStatusBadge returns correct HTML for each status', () => {
  const pending = acceptanceStatusBadge('pending');
  assert(pending.includes('Aguardando'));
  assert(pending.includes('amber'));

  const sent = acceptanceStatusBadge('token_sent');
  assert(sent.includes('Token enviado'));
  assert(sent.includes('blue'));

  const done = acceptanceStatusBadge('completed');
  assert(done.includes('Aceito'));
  assert(done.includes('green'));
});

test('acceptanceStatusBadge falls back for unknown status', () => {
  const result = acceptanceStatusBadge('unknown');
  assert(result.includes('unknown'));
  assert(result.includes('gray'));
});

test('tokenExpiresSoon returns true for nearly-expired token', () => {
  const exp = (Date.now() + 5000) / 1000;
  const token = `header.${btoa(JSON.stringify({ exp }))}.sig`;
  assert.equal(tokenExpiresSoon(token), true);
});

test('tokenExpiresSoon returns false for far-future token', () => {
  const exp = (Date.now() + 3600000) / 1000;
  const token = `header.${btoa(JSON.stringify({ exp }))}.sig`;
  assert.equal(tokenExpiresSoon(token), false);
});

test('tokenExpiresSoon handles malformed token gracefully', () => {
  assert.equal(tokenExpiresSoon('not-a-token'), false);
  assert.equal(tokenExpiresSoon(null), false);
  assert.equal(tokenExpiresSoon(''), false);
});

test('tokenExpiresSoon returns false when exp is missing', () => {
  const token = `header.${btoa(JSON.stringify({ sub: 'test' }))}.sig`;
  assert.equal(tokenExpiresSoon(token), false);
});
