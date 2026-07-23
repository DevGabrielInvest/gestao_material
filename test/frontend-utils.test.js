import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const utilsSrc = fs.readFileSync(new URL('../public/utils.js', import.meta.url), 'utf-8');

const dom = new JSDOM(
  '<!DOCTYPE html><html><body></body></html>',
  { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: false },
);

const s = dom.window.document.createElement('script');
s.textContent = utilsSrc.replace(/^(const|let) /gm, 'var ');
dom.window.document.body.appendChild(s);

// state is defined in components.js; initialize it for functions that depend on it
dom.window.state = { inventory: [], requests: [], custody: [], activity: [] };

const { escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField, statusBadge, can, canOpenPage, visibleRequests, getAlerts, addActivity } = dom.window;

test('escapeHtml escapes special characters', () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml("it's a test"), 'it&#39;s a test');
  assert.equal(escapeHtml('safe text'), 'safe text');
  assert.equal(escapeHtml(''), '');
});

test('money formats as BRL', () => {
  const result = money(1000);
  assert.ok(result.startsWith('R$'));
  assert.ok(result.endsWith('1.000,00'));
  assert.equal(money(0), 'R$\u00a00,00');
  assert.equal(money(1234.5), 'R$\u00a01.234,50');
  assert.equal(money(null), 'R$\u00a00,00');
});

test('dateOnly extracts YYYY-MM-DD', () => {
  assert.equal(dateOnly('2026-07-23T15:00:00Z'), '2026-07-23');
  assert.equal(dateOnly('2026-07-23'), '2026-07-23');
  assert.equal(dateOnly(null), '');
  assert.equal(dateOnly(undefined), '');
});

test('dateLabel formats date string', () => {
  assert.equal(dateLabel('2026-07-23'), '23/07/2026');
  assert.equal(dateLabel(null), '—');
  assert.equal(dateLabel(undefined), '—');
});

test('initials extracts initials from name', () => {
  assert.equal(initials('João Silva'), 'JS');
  assert.equal(initials('Maria'), 'M');
  assert.equal(initials(''), '');
});

test('todayLocal returns YYYY-MM-DD format', () => {
  const result = todayLocal();
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
});

test('isOverdue detects overdue custody records', () => {
  assert.equal(isOverdue({ expected: '2020-01-01', status: 'active' }), true);
  assert.equal(isOverdue({ expected: '2099-01-01', status: 'active' }), false);
  assert.equal(isOverdue({ expected: '2020-01-01', status: 'returned' }), false);
  assert.equal(isOverdue({}), false);
});

test('validateField checks required fields', () => {
  assert.equal(validateField('name', ''), 'Nome é obrigatório');
  assert.equal(validateField('name', 'Valid Name'), null);
});

test('validateField checks max length', () => {
  assert.equal(validateField('reason', 'x'.repeat(2001)), 'Motivo: máximo 2000 caracteres');
  assert.equal(validateField('reason', 'short'), null);
});

test('validateField checks email format', () => {
  assert.equal(validateField('email', 'invalid'), 'E-mail inválido');
  assert.equal(validateField('email', 'test@test.com'), null);
});

test('validateField checks min length', () => {
  assert.equal(validateField('password', 'short'), 'Senha: mínimo 8 caracteres');
  assert.equal(validateField('password', 'longenough'), null);
});

test('validateField checks number range', () => {
  assert.equal(validateField('quantity', '0'), 'Quantidade deve ser >= 1');
  assert.equal(validateField('value', '99999999.99'), null);
});

test('validateField checks integer constraint', () => {
  assert.equal(validateField('quantity', '5.5'), 'Quantidade deve ser um número inteiro');
  assert.equal(validateField('quantity', '5'), null);
});

test('validateField checks enum values', () => {
  assert.equal(validateField('type', 'invalid'), 'Tipo inválido. Permitidos: entry, exit');
  assert.equal(validateField('type', 'entry'), null);
});

test('validateField returns null for unknown field', () => {
  assert.equal(validateField('unknownField', 'any'), null);
});

test('statusBadge renders request statuses', () => {
  const pending = statusBadge('pending', 'request');
  assert(pending.includes('Pendente') && pending.includes('amber'));
  const approved = statusBadge('approved', 'request');
  assert(approved.includes('Aprovada') && approved.includes('blue'));
  const delivered = statusBadge('delivered', 'request');
  assert(delivered.includes('Entregue') && delivered.includes('green'));
  const rejected = statusBadge('rejected', 'request');
  assert(rejected.includes('Recusada') && rejected.includes('coral'));
});

test('statusBadge renders custody statuses', () => {
  const active = statusBadge('active', 'custody');
  assert(active.includes('Em posse') && active.includes('blue'));
  const returned = statusBadge('returned', 'custody');
  assert(returned.includes('Devolvido') && returned.includes('green'));
  const overdue = statusBadge('overdue', 'custody');
  assert(overdue.includes('Devolução atrasada') && overdue.includes('coral'));
});

test('statusBadge falls back for unknown status', () => {
  const result = statusBadge('unknown', 'request');
  assert(result.includes('unknown') && result.includes('gray'));
});

test('can checks permissions by role', () => {
  dom.window.currentUser = { role: 'admin' };
  assert.equal(can('approve'), true);
  assert.equal(can('manageInventory'), true);
  assert.equal(can('manageCustody'), true);
  assert.equal(can('viewReports'), true);
  assert.equal(can('request'), true);
  assert.equal(can('viewAllRequests'), true);

  dom.window.currentUser = { role: 'manager' };
  assert.equal(can('approve'), true);
  assert.equal(can('manageInventory'), true);
  assert.equal(can('manageCustody'), true);
  assert.equal(can('viewReports'), true);

  dom.window.currentUser = { role: 'requester' };
  assert.equal(can('request'), true);
  assert.equal(can('approve'), false);
  assert.equal(can('manageInventory'), false);
  assert.equal(can('manageCustody'), false);

  dom.window.currentUser = { role: 'viewer' };
  assert.equal(can('viewReports'), true);
  assert.equal(can('request'), false);
  assert.equal(can('approve'), false);

  dom.window.currentUser = null;
});

test('canOpenPage restricts requester to requests page', () => {
  dom.window.currentUser = { role: 'requester' };
  assert.equal(canOpenPage('requests'), true);
  assert.equal(canOpenPage('inventory'), false);
  assert.equal(canOpenPage('custody'), false);
  assert.equal(canOpenPage('reports'), false);

  dom.window.currentUser = { role: 'admin' };
  assert.equal(canOpenPage('requests'), true);
  assert.equal(canOpenPage('inventory'), true);

  dom.window.currentUser = null;
});

test('visibleRequests filters for requester', () => {
  const requests = [
    { requester_email: 'user@test.com', item: 'A' },
    { requester_email: 'other@test.com', item: 'B' },
  ];
  dom.window.state.requests = requests;
  dom.window.currentUser = { role: 'requester', email: 'user@test.com' };
  const result = visibleRequests();
  assert.equal(result.length, 1);
  assert.equal(result[0].item, 'A');
});

test('visibleRequests shows all for admin', () => {
  dom.window.currentUser = { role: 'admin' };
  dom.window.state.requests = [{ item: 'A' }, { item: 'B' }];
  assert.equal(visibleRequests().length, 2);
  dom.window.currentUser = null;
});

test('getAlerts returns overdue + low stock + pending for admin', () => {
  dom.window.currentUser = { role: 'manager', name: 'Gestor' };
  dom.window.state.requests = [];
  dom.window.state.inventory = [
    { id: 1, name: 'Item Baixo', quantity: 2, minimum: 5 },
    { id: 2, name: 'Item Ok', quantity: 10, minimum: 5 },
  ];
  dom.window.state.custody = [
    { inventory_id: 1, status: 'active', item: 'Monitor', holder: 'João', expected: '2020-01-01' },
    { inventory_id: 3, status: 'active', item: 'Notebook', holder: 'Maria', expected: '2020-01-01' },
  ];

  const alerts = getAlerts();
  assert(alerts.some((a) => a.type === 'overdue'), 'should have overdue alert');
  assert(alerts.every((a) => a.type !== 'low'), 'low stock items in custody should not trigger alert');
  assert(alerts[0].page && alerts[0].badge);
  dom.window.currentUser = null;
});

test('addActivity prepends to state activity', () => {
  dom.window.state.activity = [];
  addActivity('Teste', 'Detalhe');
  addActivity('Outro', 'Info');
  assert.equal(dom.window.state.activity.length, 2);
  assert.equal(dom.window.state.activity[0].text, 'Outro');
  assert.equal(dom.window.state.activity[0].detail, 'Info');
  assert(dom.window.state.activity[0].date);
});
