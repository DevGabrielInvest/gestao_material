const icons = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/><path d="M12 11v10"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 10h8M8 14h6"/></svg>',
  'user-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 11l2 2 4-5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17.5v.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  'arrow-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M14 7l5 5-5 5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20ZM13.5 7l3.5 3.5"/></svg>',
  laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="12" rx="1"/><path d="M2 19h20"/></svg>',
  'log-out': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h14l-3-3M20 17H6l3 3M18 7l-3 3M6 17l3-3"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  spinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
};

document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icons[el.dataset.icon] || icons.box; });

const roleLabels = { admin: 'Administrador', manager: 'Gestor', requester: 'Solicitante', viewer: 'Somente consulta' };
const $ = (selector) => document.querySelector(selector);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '—';
const initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[char]));
const isOverdue = (record) => record.status === 'active' && new Date(`${record.expected}T23:59:59`) < new Date();

const VALIDATION_RULES = {
  name: { required: true, maxLen: 255, label: 'Nome' },
  code: { required: true, maxLen: 255, label: 'Código' },
  category: { required: true, maxLen: 255, label: 'Categoria' },
  location: { required: true, maxLen: 255, label: 'Localização' },
  item: { required: true, maxLen: 255, label: 'Item' },
  requester: { required: true, maxLen: 255, label: 'Solicitante' },
  department: { required: true, maxLen: 255, label: 'Setor' },
  holder: { required: true, maxLen: 255, label: 'Responsável' },
  holderDepartment: { required: true, maxLen: 255, label: 'Setor' },
  reason: { required: true, maxLen: 2000, label: 'Motivo' },
  note: { required: true, maxLen: 2000, label: 'Justificativa' },
  notes: { required: false, maxLen: 2000, label: 'Observações' },
  supplier: { required: true, maxLen: 255, label: 'Fornecedor/Destino' },
  document: { required: false, maxLen: 255, label: 'Documento' },
  responsible: { required: true, maxLen: 255, label: 'Responsável' },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'E-mail' },
  password: { required: true, minLen: 8, label: 'Senha' },
  quantity: { required: true, type: 'number', min: 1, label: 'Quantidade' },
  minimum: { required: true, type: 'number', min: 0, label: 'Estoque mínimo' },
  value: { required: false, type: 'number', min: 0, label: 'Valor' },
  priority: { required: false, enum: ['Normal', 'Alta', 'Urgente'], label: 'Prioridade' },
  type: { required: true, enum: ['entry', 'exit'], label: 'Tipo' },
  date: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, label: 'Data' },
  checkout: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, label: 'Data da retirada' },
  expected: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, label: 'Previsão de devolução' },
  inventoryId: { required: true, type: 'number', min: 1, label: 'Equipamento' },
};

function validateField(name, value) {
  const rule = VALIDATION_RULES[name];
  if (!rule) return null;
  const val = value === undefined || value === null ? '' : String(value).trim();
  if (rule.required && !val) return `${rule.label} é obrigatório`;
  if (rule.maxLen && val.length > rule.maxLen) return `${rule.label}: máximo ${rule.maxLen} caracteres`;
  if (rule.minLen && val.length < rule.minLen) return `${rule.label}: mínimo ${rule.minLen} caracteres`;
  if (rule.pattern && !rule.pattern.test(val)) return `${rule.label} inválido`;
  if (rule.enum && !rule.enum.includes(val)) return `${rule.label} inválido. Permitidos: ${rule.enum.join(', ')}`;
  if (rule.type === 'number') {
    const num = Number(val);
    if (isNaN(num)) return `${rule.label} deve ser um número`;
    if (rule.min !== undefined && num < rule.min) return `${rule.label} deve ser >= ${rule.min}`;
  }
  return null;
}

function validateForm(form) {
  const errors = [];
  const fields = form.querySelectorAll('[name]');
  fields.forEach((field) => {
    const name = field.name;
    const value = field.value;
    const error = validateField(name, value);
    if (error) {
      errors.push({ field: name, message: error });
      field.style.borderColor = 'var(--coral)';
      field.setAttribute('data-error', error);
    } else {
      field.style.borderColor = '';
      field.removeAttribute('data-error');
    }
  });
  return errors;
}

function clearFormErrors(form) {
  const fields = form.querySelectorAll('[name]');
  fields.forEach((field) => {
    field.style.borderColor = '';
    field.removeAttribute('data-error');
  });
}

const permissionMap = {
  approve: ['admin', 'manager'],
  manageInventory: ['admin', 'manager'],
  manageCustody: ['admin', 'manager'],
  viewReports: ['admin', 'manager', 'viewer'],
  request: ['admin', 'manager', 'requester'],
  viewAllRequests: ['admin', 'manager', 'viewer'],
};
const can = (permission) => Boolean(currentUser && permissionMap[permission]?.includes(currentUser.role));
const canOpenPage = (page) => currentUser?.role !== 'requester' || page === 'requests';

const sessionKey = 'dfa-session-v2';
const tokenKey = 'dfa-token-v2';
const refreshTokenKey = 'dfa-refresh-v2';

function getToken() { return sessionStorage.getItem(tokenKey); }
function setToken(token) { sessionStorage.setItem(tokenKey, token); }
function getRefreshToken() { return sessionStorage.getItem(refreshTokenKey); }
function setRefreshToken(token) { sessionStorage.setItem(refreshTokenKey, token); }
function clearToken() { sessionStorage.removeItem(tokenKey); sessionStorage.removeItem(refreshTokenKey); sessionStorage.removeItem(sessionKey); }

function statusBadge(status, context = 'request') {
  const labels = context === 'request'
    ? { pending: ['Pendente', 'amber'], approved: ['Aprovada', 'blue'], delivered: ['Entregue', 'green'], rejected: ['Recusada', 'coral'] }
    : { active: ['Em posse', 'blue'], returned: ['Devolvido', 'green'], overdue: ['Devolução atrasada', 'coral'] };
  const [label, color] = labels[status] || [status, 'gray'];
  return `<span class="status ${color}">${label}</span>`;
}

function addActivity(text, detail) {
  state.activity.unshift({ text, detail, date: new Date().toISOString() });
  state.activity = state.activity.slice(0, 10);
}

function visibleRequests() {
  return can('viewAllRequests') ? state.requests : state.requests.filter((item) => item.requester_email === currentUser?.email || (!item.requester_email && item.requester === currentUser?.name));
}

function getAlerts() {
  const ownPending = visibleRequests().filter((item) => item.status === 'pending');
  if (currentUser?.role === 'requester') return ownPending.map((item) => ({ type: 'pending', title: item.item, detail: `Solicitado em ${dateLabel(item.date)} · Aguardando análise`, badge: 'Pendente', page: 'requests' }));
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const lowStock = state.inventory.filter((item) => item.quantity <= item.minimum && !custodyIds.has(item.id));
  return [
    ...activeCustody.filter(isOverdue).map((item) => ({ type: 'overdue', title: item.item, detail: `${item.holder} · Devolução prevista para ${dateLabel(item.expected)}`, badge: 'Atrasado', page: 'custody' })),
    ...lowStock.map((item) => ({ type: 'low', title: item.name, detail: `Restam ${item.quantity} un. · Mínimo recomendado: ${item.minimum}`, badge: 'Estoque baixo', page: 'inventory' })),
    ...ownPending.map((item) => ({ type: 'pending', title: item.item, detail: `${item.requester} · Solicitado em ${dateLabel(item.date)}`, badge: 'Pendente', page: 'requests' })),
  ];
}

function consumptionSummary(dateFrom, dateTo) {
  const grouped = new Map();
  state.movements
    .filter((item) => item.type === 'exit' && (!dateFrom || (item.date || '').slice(0, 10) >= dateFrom) && (!dateTo || (item.date || '').slice(0, 10) <= dateTo))
    .forEach((item) => grouped.set(item.item, (grouped.get(item.item) || 0) + Number(item.quantity)));
  return [...grouped.entries()].map(([item, quantity]) => ({ item, quantity })).sort((a, b) => b.quantity - a.quantity);
}

const requestStatusLabels = { pending: 'Pendente', approved: 'Aprovada', delivered: 'Entregue', rejected: 'Recusada' };

function csvMoney(value) {
  return Number(value || 0).toFixed(2).replace('.', ',');
}

function findInventoryByName(name) {
  return state.inventory.find((item) => item.name.toLowerCase() === String(name || '').toLowerCase());
}

function requestCode(id) {
  return `SOL-${String(id).padStart(4, '0')}`;
}

function requestFromMovement(movement) {
  const match = String(movement.document || '').match(/^SOL-(\d+)$/i);
  if (!match) return null;
  return state.requests.find((request) => request.id === Number(match[1]));
}

function movementCostCenter(movement, request = null) {
  if (request?.department) return request.department;
  if (movement.type === 'entry') return 'Estoque / compras';
  const destination = String(movement.supplier || '').trim();
  if (!destination) return 'Não informado';
  if (destination.includes('·')) return destination.split('·')[0].trim();
  return destination.replace(/^Setor\s+/i, '').trim();
}

function exportCsv(filename, headers, rows, delimiter = ',') {
  const esc = (v) => {
    const s = String(v ?? '');
    return (s.includes(delimiter) || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((row) => row.map(esc).join(delimiter)).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportMovementsCsv() {
  const dateFrom = $('#movementDateFrom').value;
  const dateTo = $('#movementDateTo').value;
  const type = $('#movementType').value;
  const rows = state.movements.filter((m) => {
    const d = (m.date || '').slice(0, 10);
    return (type === 'all' || m.type === type) && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
  });
  exportCsv(
    `movimentacoes-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Data', 'Tipo', 'Centro de custo', 'Item', 'Código', 'Categoria', 'Quantidade', 'Valor unitário (R$)', 'Valor total estimado (R$)', 'Fornecedor / destino', 'Documento / NF', 'Responsável', 'Solicitação vinculada', 'Aprovador', 'Data da decisão', 'Status do pedido', 'Observações'],
    rows.map((m) => {
      const request = requestFromMovement(m);
      const item = state.inventory.find((entry) => entry.id === m.inventory_id) || findInventoryByName(m.item) || {};
      const unitValue = Number(item.value || 0);
      return [
        dateLabel(m.date),
        m.type === 'entry' ? 'Entrada' : 'Saída',
        movementCostCenter(m, request),
        m.item,
        m.code,
        item.category || '',
        m.quantity,
        csvMoney(unitValue),
        csvMoney(Number(m.quantity) * unitValue),
        m.supplier || '',
        m.document || '',
        m.responsible,
        request ? requestCode(request.id) : '',
        request?.decided_by || '',
        request?.decided_at ? dateLabel(request.decided_at.slice(0, 10)) : '',
        request ? requestStatusLabels[request.status] || request.status : 'Registrada',
        m.notes || request?.decision_note || '',
      ];
    }),
    ';'
  );
  showToast('Movimentações exportadas — abra o arquivo no Excel.');
}

function exportInventoryCsv() {
  const custodyIds = new Set(state.custody.filter((c) => c.status === 'active').map((c) => c.inventory_id));
  exportCsv(
    `inventario-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Nome', 'Código', 'Categoria', 'Localização', 'Quantidade', 'Estoque mínimo', 'Valor unitário (R$)', 'Valor total (R$)', 'Situação'],
    state.inventory.map((item) => [
      item.name, item.code, item.category, item.location, item.quantity, item.minimum,
      Number(item.value).toFixed(2).replace('.', ','),
      (item.quantity * Number(item.value)).toFixed(2).replace('.', ','),
      custodyIds.has(item.id) ? 'Em posse' : item.quantity <= item.minimum ? 'Estoque baixo' : 'Disponível',
    ])
  );
  showToast('Inventário exportado — abra o arquivo no Excel.');
}

function exportFinancialCsv() {
  const dateFrom = $('#reportDateFrom')?.value || '';
  const dateTo = $('#reportDateTo')?.value || '';
  const inPeriod = (value) => {
    const d = (value || '').slice(0, 10);
    return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
  };
  const requestRows = state.requests.filter((request) => inPeriod(request.date)).map((request) => {
    const item = findInventoryByName(request.item) || {};
    const linkedMovement = state.movements.find((movement) => movement.document === requestCode(request.id));
    const unitValue = Number(item.value || 0);
    return [
      'Solicitação',
      dateLabel(request.date),
      request.department,
      requestStatusLabels[request.status] || request.status,
      request.item,
      item.code || '',
      item.category || '',
      request.quantity,
      csvMoney(unitValue),
      csvMoney(Number(request.quantity) * unitValue),
      linkedMovement?.supplier || '',
      linkedMovement?.document || requestCode(request.id),
      request.requester,
      request.decided_by || '',
      request.decided_at ? dateLabel(request.decided_at.slice(0, 10)) : '',
      request.priority,
      linkedMovement?.notes || request.reason,
      request.decision_note || '',
    ];
  });
  const movementRows = state.movements.filter((movement) => inPeriod(movement.date) && !requestFromMovement(movement)).map((movement) => {
    const item = state.inventory.find((entry) => entry.id === movement.inventory_id) || findInventoryByName(movement.item) || {};
    const unitValue = Number(item.value || 0);
    return [
      movement.type === 'entry' ? 'Entrada' : 'Saída',
      dateLabel(movement.date),
      movementCostCenter(movement),
      'Registrada',
      movement.item,
      movement.code,
      item.category || '',
      movement.quantity,
      csvMoney(unitValue),
      csvMoney(Number(movement.quantity) * unitValue),
      movement.supplier || '',
      movement.document || '',
      movement.responsible,
      '', '', '', movement.notes || '', '',
    ];
  });
  exportCsv(
    `financeiro-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Tipo', 'Data', 'Centro de custo / setor', 'Status', 'Item', 'Código', 'Categoria', 'Quantidade', 'Valor unitário estimado (R$)', 'Valor total estimado (R$)', 'Fornecedor / destino', 'Documento / NF', 'Solicitante / responsável', 'Aprovador', 'Data da aprovação / decisão', 'Prioridade', 'Justificativa / observações', 'Observação da decisão'],
    [...requestRows, ...movementRows],
    ';'
  );
  showToast('CSV financeiro exportado com dados de pedidos, custos e documentos.');
}

function pdfSafe(value) {
  return String(value ?? '').replace(/[–—•·]/g, '-').replace(/[^ -ÿ]/g, '');
}

function pdfEscape(value) {
  return pdfSafe(value).replace(/([\\()])/g, '\\$1');
}

function wrapPdfText(value, max = 88) {
  const words = pdfSafe(value).split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > max && line) { lines.push(line); line = word; } else line = `${line} ${word}`.trim();
  });
  if (line) lines.push(line);
  return lines;
}

function byteString(value) {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) bytes[index] = value.charCodeAt(index) & 0xff;
  return bytes;
}

function joinBytes(parts) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { result.set(part, offset); offset += part.length; });
  return result;
}

function loadLetterheadLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1189; canvas.height = 305;
      const context = canvas.getContext('2d');
      context.fillStyle = '#111111'; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const binary = atob(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]);
      resolve(byteString(binary));
    };
    image.onerror = reject;
    image.src = 'logo DF nova.png';
  });
}

async function downloadPdf(filename, title, subtitle, rows) {
  const normalized = [];
  rows.forEach((row) => {
    if (row.spacer) { normalized.push({ spacer: true, height: row.height || 8 }); return; }
    wrapPdfText(row.text, row.heading ? 72 : 92).forEach((text) => normalized.push({ ...row, text }));
  });
  const pages = [[]];
  let used = 0;
  normalized.forEach((row) => {
    const height = row.spacer ? row.height : row.heading ? 23 : 14;
    if (used + height > 560) { pages.push([]); used = 0; }
    pages.at(-1).push(row); used += height;
  });

  const logoBytes = await loadLetterheadLogo();
  const objects = [];
  const pageRefs = pages.map((_, index) => `${6 + index * 2} 0 R`).join(' ');
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>';
  objects[5] = { dictionary: `<< /Type /XObject /Subtype /Image /Width 1189 /Height 305 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>`, stream: logoBytes };

  pages.forEach((page, index) => {
    const pageObject = 6 + index * 2;
    const contentObject = pageObject + 1;
    let y = 696;
    const commands = [
      'q 0.067 0.067 0.067 rg 0 754 595 88 re f Q',
      'q 0.78 0.59 0.25 rg 0 749 595 5 re f Q',
      'q 280 0 0 72 38 762 cm /Logo Do Q',
      `BT /F2 16 Tf 0.10 0.10 0.10 rg 48 724 Td (${pdfEscape(title)}) Tj ET`,
      `BT /F1 8 Tf 0.42 0.42 0.42 rg 48 709 Td (${pdfEscape(subtitle)}) Tj ET`,
    ];
    page.forEach((row) => {
      if (row.spacer) { y -= row.height; return; }
      const font = row.heading || row.bold ? 'F2' : 'F1';
      const size = row.heading ? 12 : row.bold ? 9.5 : 9;
      const color = row.heading ? '0.72 0.46 0.15' : '0.15 0.15 0.15';
      commands.push(`BT /${font} ${size} Tf ${color} rg 48 ${y} Td (${pdfEscape(row.text)}) Tj ET`);
      y -= row.heading ? 23 : 14;
    });
    commands.push('q 0.78 0.59 0.25 rg 0 90 595 2 re f Q');
    commands.push('BT /F2 7 Tf 0.12 0.12 0.12 rg 48 71 Td (BELO HORIZONTE - MG) Tj ET');
    commands.push('BT /F1 6.5 Tf 0.34 0.34 0.34 rg 48 59 Td (+55 31 3201-2151 | R. Felipe dos Santos, 521 - Lourdes) Tj ET');
    commands.push('BT /F2 7 Tf 0.12 0.12 0.12 rg 225 71 Td (SÃO PAULO - SP) Tj ET');
    commands.push('BT /F1 6.5 Tf 0.34 0.34 0.34 rg 225 59 Td (+55 11 2770-1304 | Av. Cidade Jardim, 377 - Itaim Bibi) Tj ET');
    commands.push('BT /F2 7 Tf 0.12 0.12 0.12 rg 432 71 Td (BRASÍLIA - DF) Tj ET');
    commands.push('BT /F1 6.5 Tf 0.34 0.34 0.34 rg 432 59 Td (+55 61 3550-7517 | SHN, Quadra 02) Tj ET');
    commands.push('BT /F1 6 Tf 0.5 0.5 0.5 rg 48 38 Td (Documento gerado pelo sistema de gestão patrimonial) Tj ET');
    commands.push(`BT /F1 6 Tf 0.5 0.5 0.5 rg 500 38 Td (Página ${index + 1} de ${pages.length}) Tj ET`);
    const stream = commands.join('\n');
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Logo 5 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = { dictionary: `<< /Length ${stream.length} >>`, stream: byteString(stream) };
  });

  const parts = [byteString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
  const offsets = [0];
  let pdfLength = parts[0].length;
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdfLength;
    const object = objects[index];
    const bytes = typeof object === 'string'
      ? byteString(`${index} 0 obj\n${object}\nendobj\n`)
      : joinBytes([byteString(`${index} 0 obj\n${object.dictionary}\nstream\n`), object.stream, byteString('\nendstream\nendobj\n')]);
    parts.push(bytes); pdfLength += bytes.length;
  }
  let trailer = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) trailer += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  trailer += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${pdfLength}\n%%EOF`;
  parts.push(byteString(trailer));
  const bytes = joinBytes(parts);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function generateCustodyPdf(id) {
  const record = state.custody.find((item) => item.id === id);
  if (!record) return;
  const rows = [
    { heading: true, text: 'TERMO DE RESPONSABILIDADE E GUARDA DE EQUIPAMENTO' },
    { text: `Termo: TER-${record.code}-${record.id}`, bold: true },
    { text: `Emitido em: ${new Date().toLocaleString('pt-BR')} por ${currentUser.name}` }, { spacer: true },
    { heading: true, text: 'IDENTIFICAÇÃO DO BEM' },
    { text: `Equipamento: ${record.item}` }, { text: `Código patrimonial: ${record.code}` }, { text: `Valor registrado: ${money(record.value)}` }, { spacer: true },
    { heading: true, text: 'RESPONSÁVEL PELA POSSE' },
    { text: `Nome: ${record.holder}` }, { text: `Setor: ${record.department}` }, { text: `Data da retirada: ${dateLabel(record.checkout)}` }, { text: `Devolução prevista: ${dateLabel(record.expected)}` }, { text: `Situação: ${record.status === 'active' ? 'Em posse' : `Devolvido em ${dateLabel(record.returned)}`}` }, { spacer: true },
    { heading: true, text: 'DECLARAÇÃO DE RESPONSABILIDADE' },
    { text: 'Declaro que recebi o bem acima identificado nas condições registradas neste termo, comprometendo-me a utilizá-lo exclusivamente para atividades profissionais, zelar por sua conservação e comunicar imediatamente qualquer dano, perda ou incidente.' },
    { text: 'Comprometo-me ainda a devolver o equipamento e seus acessórios na data acordada ou quando solicitado pelo escritório, no mesmo estado de conservação em que foram entregues, ressalvado o desgaste natural de uso.' },
    { text: `Observações de entrega: ${record.notes || 'Nenhuma observação registrada.'}` },
    { spacer: true, height: 24 }, { text: '________________________________________        ________________________________________' },
    { text: `Responsável pela posse: ${record.holder}    |    Administração DFA` },
  ];
  await downloadPdf(`termo-${record.code.toLowerCase()}-${record.id}.pdf`, 'TERMO DE RESPONSABILIDADE', 'GESTÃO PATRIMONIAL - DANIEL FREDERIGHI ADVOGADOS ASSOCIADOS', rows);
  showToast('Termo de responsabilidade gerado em PDF.');
}

async function exportReportsPdf() {
  const inventoryValue = state.inventory.reduce((sum, item) => sum + item.quantity * item.value, 0);
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const rows = [
    { heading: true, text: 'RELATÓRIO GERENCIAL DE MATERIAIS E PATRIMÔNIO' },
    { text: `Emitido em: ${new Date().toLocaleString('pt-BR')} por ${currentUser.name}` }, { spacer: true },
    { heading: true, text: 'RESUMO EXECUTIVO' },
    { text: `Itens cadastrados: ${state.inventory.length}` }, { text: `Valor estimado do inventário: ${money(inventoryValue)}` }, { text: `Bens atualmente em posse: ${activeCustody.length}` }, { text: `Solicitações pendentes: ${state.requests.filter((item) => item.status === 'pending').length}` }, { spacer: true },
    { heading: true, text: 'CONSUMO POR ITEM' },
    ...consumptionSummary().map((item) => ({ text: `${item.item}: ${item.quantity} unidade(s)` })), { spacer: true },
    { heading: true, text: 'PATRIMÔNIO SOB RESPONSABILIDADE' },
    ...activeCustody.map((item) => ({ text: `${item.holder} - ${item.item} (${item.code}) - ${money(item.value)} - devolver até ${dateLabel(item.expected)}` })), { spacer: true },
    { heading: true, text: 'POSIÇÃO DO INVENTÁRIO' },
    ...state.inventory.map((item) => ({ text: `${item.code} - ${item.name} - ${item.quantity} un. - mínimo ${item.minimum} - total ${money(item.quantity * item.value)}${custodyIds.has(item.id) ? ' - EM POSSE' : item.quantity <= item.minimum ? ' - REPOSIÇÃO NECESSÁRIA' : ''}` })),
  ];
  await downloadPdf(`relatorio-patrimonial-${new Date().toISOString().slice(0, 10)}.pdf`, 'RELATÓRIO GERENCIAL', 'MATERIAIS E PATRIMÔNIO - DANIEL FREDERIGHI ADVOGADOS ASSOCIADOS', rows);
  showToast('Relatório gerencial exportado em PDF.');
}
