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
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  fingerprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5.5 4.5A10.5 10.5 0 0 0 2 12c0 2.5.9 4.8 2.3 6.6M8.2 7.8A5.5 5.5 0 0 0 6.5 12c0 1.3.5 2.6 1.2 3.6M12 2a10 10 0 0 1 10 10c0 2.5-.9 4.8-2.3 6.6M15.8 7.8A5.5 5.5 0 0 1 17.5 12c0 1.3-.5 2.6-1.2 3.6M12 10v2l1.5 1.5M12 5v2"/></svg>',
};

document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icons[el.dataset.icon] || icons.box; });

const roleLabels = { admin: 'Administrador', manager: 'Gestor', requester: 'Solicitante', viewer: 'Somente consulta' };
const $ = (selector) => document.querySelector(selector);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateOnly = (value) => String(value ?? '').slice(0, 10);
const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const dateLabel = (value) => value ? new Date(`${dateOnly(value)}T12:00:00`).toLocaleDateString('pt-BR') : '—';
const initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[char]));
const isOverdue = (record) => record.status === 'active' && new Date(`${dateOnly(record.expected)}T23:59:59`) < new Date();

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
  quantity: { required: true, type: 'number', min: 1, max: 1_000_000, integer: true, label: 'Quantidade' },
  minimum: { required: true, type: 'number', min: 0, max: 1_000_000, integer: true, label: 'Estoque mínimo' },
  value: { required: false, type: 'number', min: 0, max: 99_999_999.99, label: 'Valor' },
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
    if (rule.integer && !Number.isInteger(num)) return `${rule.label} deve ser um número inteiro`;
    if (rule.min !== undefined && num < rule.min) return `${rule.label} deve ser >= ${rule.min}`;
    if (rule.max !== undefined && num > rule.max) return `${rule.label} deve ser <= ${rule.max}`;
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

async function exportMovementsCsv() {
  try {
    const query = sectionQuery('movements');
    await apiDownload(`/reports/movements-csv${query ? `?${query.slice(1)}` : ''}`, `movimentacoes-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Movimentações exportadas — abra o arquivo no Excel.');
  } catch (err) { showToast(err.message); }
}

async function exportInventoryCsv() {
  try {
    await apiDownload('/reports/inventory-csv', `inventario-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Inventário exportado — abra o arquivo no Excel.');
  } catch (err) { showToast(err.message); }
}

async function exportFinancialCsv() {
  try {
    const params = new URLSearchParams();
    const dateFrom = $('#reportDateFrom')?.value || '';
    const dateTo = $('#reportDateTo')?.value || '';
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const query = params.toString();
    await apiDownload(`/reports/financial-csv${query ? `?${query}` : ''}`, `financeiro-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('CSV financeiro exportado com dados de pedidos, custos e documentos.');
  } catch (err) { showToast(err.message); }
}

async function generateCustodyPdf(id) {
  try {
    await apiDownload(`/custody/${id}/pdf`, `termo-${id}.pdf`);
    showToast('Termo de responsabilidade gerado em PDF.');
  } catch (err) { showToast(err.message); }
}

async function exportReportsPdf() {
  try {
    await apiDownload('/reports/pdf', `relatorio-patrimonial-${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('Relatório gerencial exportado em PDF.');
  } catch (err) { showToast(err.message); }
}
