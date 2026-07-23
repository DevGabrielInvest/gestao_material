import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const utilsSrc = fs.readFileSync(new URL('../public/utils.js', import.meta.url), 'utf-8');
const apiSrc = fs.readFileSync(new URL('../public/api.js', import.meta.url), 'utf-8');
const componentsSrc = fs.readFileSync(new URL('../public/components.js', import.meta.url), 'utf-8');

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
  <div id="dashboardPage" class="page active"></div>
  <div id="inventoryPage" class="page hidden"></div>
  <div id="requestsPage" class="page hidden"></div>
  <div id="custodyPage" class="page hidden"></div>
  <div id="movementsPage" class="page hidden"></div>
  <div id="reportsPage" class="page hidden"></div>
  <canvas id="categoryChart"></canvas>
  <canvas id="movementChart"></canvas>
  <canvas id="requestChart"></canvas>
  <div id="loginForm"></div>
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

const toVar = (src) => src.replace(/^(const|let) /gm, 'var ');

const s1 = dom.window.document.createElement('script');
s1.textContent = toVar(utilsSrc);
dom.window.document.body.appendChild(s1);

dom.window.endSession = () => { dom.window.clearToken(); };

const s2 = dom.window.document.createElement('script');
s2.textContent = toVar(apiSrc);
dom.window.document.body.appendChild(s2);

const s3 = dom.window.document.createElement('script');
s3.textContent = toVar(componentsSrc);
dom.window.document.body.appendChild(s3);

const { state, navigate, showToast, openModal, closeModal, setLoading } = dom.window;

test('state is initialized with default values', () => {
  assert.equal(Array.isArray(state.inventory), true);
  assert.equal(Array.isArray(state.requests), true);
  assert.equal(Array.isArray(state.custody), true);
  assert.equal(Array.isArray(state.movements), true);
  assert.equal(Array.isArray(state.activity), true);
  assert.equal(Array.isArray(state.categories), true);
  assert.equal(state.dashboard, null);
});

test('navigate switches page visibility', () => {
  const inv = dom.window.document.getElementById('inventoryPage');
  const dash = dom.window.document.getElementById('dashboardPage');

  assert(dash.classList.contains('active'));
  assert(!inv.classList.contains('active'));

  navigate('inventory');
  assert(!dash.classList.contains('active'));
  assert(inv.classList.contains('active'));
});

test('showToast creates a visible toast', () => {
  const toastMsg = dom.window.document.getElementById('toastMessage');
  const toast = dom.window.document.getElementById('toast');

  showToast('Test message');
  assert.equal(toastMsg.textContent, 'Test message');
  assert(toast.classList.contains('show'));
});

test('openModal fills modal elements', () => {
  closeModal();

  openModal({
    eyebrow: 'SEÇÃO TESTE',
    title: 'Título Teste',
    submitLabel: 'Salvar',
    body: '<input name="test" />',
    action: 'create',
  });

  const backdrop = dom.window.document.getElementById('modalBackdrop');
  assert(backdrop.classList.contains('open'));
  assert.equal(dom.window.document.getElementById('modalEyebrow').textContent, 'SEÇÃO TESTE');
  assert.equal(dom.window.document.getElementById('modalTitle').textContent, 'Título Teste');
  assert.equal(dom.window.document.getElementById('submitModal').textContent, 'Salvar');
  assert(dom.window.document.getElementById('modalBody').innerHTML.includes('<input'));
});

test('closeModal hides modal', () => {
  openModal({ title: 'T', submitLabel: 'X', body: '<p>content</p>' });

  closeModal();
  const backdrop = dom.window.document.getElementById('modalBackdrop');
  assert(!backdrop.classList.contains('open'));
});

test('setLoading disables submit button', () => {
  openModal({ title: 'T', submitLabel: 'Go', body: '<input />' });
  setLoading(true);
  const btn = dom.window.document.getElementById('submitModal');
  assert(btn.disabled);
  assert(btn.innerHTML.includes('Aguarde'));
});

test('setLoading restores button text', () => {
  openModal({ title: 'T', submitLabel: 'Salvar', body: '<input />' });
  setLoading(true);
  setLoading(false);
  const btn = dom.window.document.getElementById('submitModal');
  assert(!btn.disabled);
});
