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
let currentUser = null;
let activeRequestFilter = 'all';
let modalAction = null;

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

// Frontend validation
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

let state = {
  inventory: [], requests: [], custody: [], movements: [], activity: [],
  pagination: {
    inventory: { offset: 0, limit: 100, total: 0, hasMore: false },
    requests: { offset: 0, limit: 50, total: 0, hasMore: false },
    custody: { offset: 0, limit: 50, total: 0, hasMore: false },
    movements: { offset: 0, limit: 50, total: 0, hasMore: false },
    activity: { offset: 0, limit: 20, total: 0, hasMore: false },
  }
};

const sessionKey = 'dfa-session-v2';
const tokenKey = 'dfa-token-v2';

function getToken() { return sessionStorage.getItem(tokenKey); }
function setToken(token) { sessionStorage.setItem(tokenKey, token); }
function clearToken() { sessionStorage.removeItem(tokenKey); sessionStorage.removeItem(sessionKey); }

async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const maxRetries = options._retries ?? 0;
  try {
    const res = await fetch(`/api${path}`, { ...options, headers });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      if (res.status >= 500 && maxRetries < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return api(path, { ...options, _retries: maxRetries + 1 });
      }
      const suffix = data.requestId ? ` (id: ${data.requestId})` : '';
      throw new Error(`${data.error || 'Erro na requisição'}${suffix}`);
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Sem conexão com o servidor. Verifique sua internet.');
    }
    throw err;
  }
}

const apiGet = (path) => api(path);
const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
const apiPut = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
const apiDelete = (path) => api(path, { method: 'DELETE' });

async function loadState() {
  try {
    const results = await Promise.all([
      apiGet('/inventory?limit=100&offset=0'),
      apiGet('/requests?limit=50&offset=0'),
      apiGet('/custody?limit=50&offset=0'),
      apiGet('/movements?limit=50&offset=0'),
      apiGet('/activity?limit=20&offset=0'),
    ]);
    state.inventory = results[0].data || results[0];
    state.requests = results[1].data || results[1];
    state.custody = results[2].data || results[2];
    state.movements = results[3].data || results[3];
    state.activity = results[4].data || results[4];
    state.pagination = {
      inventory: results[0].total ? { total: results[0].total, limit: results[0].limit, offset: results[0].offset, hasMore: results[0].hasMore } : null,
      requests: results[1].total ? { total: results[1].total, limit: results[1].limit, offset: results[1].offset, hasMore: results[1].hasMore } : null,
      custody: results[2].total ? { total: results[2].total, limit: results[2].limit, offset: results[2].offset, hasMore: results[2].hasMore } : null,
      movements: results[3].total ? { total: results[3].total, limit: results[3].limit, offset: results[3].offset, hasMore: results[3].hasMore } : null,
      activity: results[4].total ? { total: results[4].total, limit: results[4].limit, offset: results[4].offset, hasMore: results[4].hasMore } : null,
    };
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showToast(err.message || 'Não foi possível carregar os dados agora.');
  }
}

async function loadMore(section) {
  try {
    const pagInfo = state.pagination[section];
    if (!pagInfo || !pagInfo.hasMore) return;
    const newOffset = pagInfo.offset + pagInfo.limit;
    const response = await apiGet(`/${section}?limit=${pagInfo.limit}&offset=${newOffset}`);
    const newData = response.data || response;
    state[section].push(...newData);
    pagInfo.offset = newOffset;
    pagInfo.hasMore = response.hasMore;
    if (section === 'inventory') renderInventory();
    else if (section === 'requests') renderRequests();
    else if (section === 'custody') renderCustody();
    else if (section === 'movements') renderMovements();
    else if (section === 'activity') renderDashboard();
  } catch (err) {
    console.error(`Erro ao carregar mais ${section}:`, err);
    showToast(`Erro ao carregar mais dados de ${section}`);
  }
}

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

function renderDashboard() {
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const low = state.inventory.filter((item) => item.quantity <= item.minimum && !custodyIds.has(item.id));
  const pending = state.requests.filter((item) => item.status === 'pending');
  const totalValue = activeCustody.reduce((sum, item) => sum + Number(item.value), 0);
  $('#statItems').textContent = state.inventory.length;
  $('#statCategories').textContent = `${new Set(state.inventory.map((item) => item.category)).size} categorias`;
  $('#statLowStock').textContent = low.length;
  $('#statCustody').textContent = activeCustody.length;
  $('#statCustodyValue').textContent = `${money(totalValue)} sob responsabilidade`;
  $('#statRequests').textContent = pending.length;
  $('#requestNavCount').textContent = pending.length;
  const allAlerts = getAlerts();
  $('#notificationDot').style.display = allAlerts.length ? 'block' : 'none';
  $('#notificationButton').setAttribute('aria-label', `Notificações: ${allAlerts.length} alerta(s)`);

  const alerts = allAlerts.slice(0, 4);
  $('#attentionList').innerHTML = alerts.length ? alerts.map((item) => `<div class="attention-item"><div class="item-symbol ${item.type}">${item.type === 'low' ? '!' : '•'}</div><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div><b>${item.badge}</b></div>`).join('') : '<div class="empty-state show"><h3>Tudo em ordem</h3><p>Não há alertas no momento.</p></div>';

  $('#activityList').innerHTML = state.activity.slice(0, 4).map((item) => {
    const date = new Date(item.date);
    return `<div class="timeline-item"><i class="timeline-dot"></i><strong>${escapeHtml(item.text)}</strong><p>${escapeHtml(item.detail)}</p><time>${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time></div>`;
  }).join('');

  $('#custodyPreviewBody').innerHTML = activeCustody.slice(0, 4).map((item) => `<tr><td><div class="item-cell"><div class="item-thumb">${escapeHtml(item.item[0])}</div><div><strong>${escapeHtml(item.item)}</strong><small>${escapeHtml(item.code)}</small></div></div></td><td><div class="person-cell"><div class="person-avatar">${initials(item.holder)}</div>${escapeHtml(item.holder)}</div></td><td>${dateLabel(item.checkout)}</td><td>${dateLabel(item.expected)}</td><td>${statusBadge(isOverdue(item) ? 'overdue' : 'active', 'custody')}</td></tr>`).join('') || '<tr><td colspan="5">Nenhum equipamento em posse.</td></tr>';
}

function renderInventory() {
  const categories = [...new Set(state.inventory.map((item) => item.category))].sort();
  const current = $('#inventoryCategory').value;
  $('#inventoryCategory').innerHTML = '<option value="all">Todas as categorias</option>' + categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  $('#inventoryCategory').value = categories.includes(current) ? current : 'all';
  const term = $('#inventorySearch').value.toLowerCase();
  const category = $('#inventoryCategory').value;
  const status = $('#inventoryStatus').value;
  const custodyIds = new Set(state.custody.filter((item) => item.status === 'active').map((item) => item.inventory_id));
  const filtered = state.inventory.filter((item) => {
    const matchesTerm = [item.name, item.code, item.location].join(' ').toLowerCase().includes(term);
    const matchesCategory = category === 'all' || item.category === category;
    const itemStatus = custodyIds.has(item.id) ? 'custody' : item.quantity <= item.minimum ? 'low' : 'available';
    return matchesTerm && matchesCategory && (status === 'all' || itemStatus === status);
  });

  const totalUnits = state.inventory.reduce((sum, item) => sum + Number(item.quantity), 0);
  const value = state.inventory.reduce((sum, item) => sum + Number(item.quantity) * Number(item.value), 0);
  $('#inventorySummary').innerHTML = `<div class="summary-card"><span>Tipos de item</span><strong>${state.inventory.length}</strong></div><div class="summary-card"><span>Unidades totais</span><strong>${totalUnits}</strong></div><div class="summary-card"><span>Valor estimado</span><strong>${money(value)}</strong></div>`;
  $('#inventoryBody').innerHTML = filtered.map((item) => {
    const inCustody = custodyIds.has(item.id);
    const low = item.quantity <= item.minimum;
    const badge = inCustody ? statusBadge('active', 'custody') : low ? '<span class="status amber">Estoque baixo</span>' : '<span class="status green">Disponível</span>';
    const actions = can('manageInventory')
      ? `<button class="row-action edit-item" data-id="${item.id}" title="Editar item">${icons.edit}</button><button class="row-action danger delete-item" data-id="${item.id}" title="Excluir item">${icons.trash}</button>`
      : '';
    return `<tr><td><div class="item-cell"><div class="item-thumb">${escapeHtml(item.name[0])}</div><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)} · ${money(item.value)}</small></div></div></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.location)}</td><td><span class="quantity ${low ? 'low' : ''}">${item.quantity}</span> <small>un.</small></td><td>${badge}</td><td><div class="row-actions">${actions}</div></td></tr>`;
  }).join('');
  const pagInfo = state.pagination.inventory;
  if (pagInfo && pagInfo.hasMore) {
    $('#inventoryBody').innerHTML += `<tr><td colspan="6" style="text-align: center; padding: 1.5rem;"><button class="button secondary" id="loadMoreInventory">Carregar mais itens (${pagInfo.total - state.inventory.length} restantes)</button></td></tr>`;
    setTimeout(() => $('#loadMoreInventory')?.addEventListener('click', () => loadMore('inventory')), 0);
  }
  $('#inventoryEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.edit-item').forEach((button) => button.addEventListener('click', () => openItemModal(Number(button.dataset.id))));
  document.querySelectorAll('.delete-item').forEach((button) => button.addEventListener('click', () => deleteInventoryItem(Number(button.dataset.id))));
}

function renderRequests() {
  const visible = visibleRequests();
  const pending = visible.filter((item) => item.status === 'pending').length;
  $('#allRequestCount').textContent = visible.length;
  $('#pendingRequestCount').textContent = pending;
  $('#requestNavCount').textContent = pending;
  $('#requestPermissionNote').textContent = can('approve') ? 'Você pode analisar pedidos. Toda aprovação ou recusa exige justificativa e fica registrada no histórico.' : currentUser?.role === 'requester' ? 'Você está visualizando apenas as solicitações criadas pela sua conta.' : 'Perfil de consulta: pedidos e históricos estão disponíveis somente para leitura.';
  const filtered = activeRequestFilter === 'all' ? visible : visible.filter((item) => item.status === activeRequestFilter);
  let requestsHtml = filtered.map((item) => {
    const decisionNote = item.decision_note;
    const decision = decisionNote ? `<div class="approval-record"><span>${escapeHtml(item.decided_by || 'Administração')} · ${dateLabel((item.decided_at || '').slice(0, 10))}</span><p>${escapeHtml(decisionNote)}</p></div>` : '';
    let actions = `<span class="asset-value">Solicitado em ${dateLabel(item.date)}</span>`;
    if (can('approve') && item.status === 'pending') actions = `<button class="button small primary request-approve" data-id="${item.id}">Aprovar</button><button class="button small danger request-reject" data-id="${item.id}">Recusar</button>`;
    if (can('approve') && item.status === 'approved') actions = `<button class="button small primary request-deliver" data-id="${item.id}">Marcar como entregue</button>`;
    const historyCount = Array.isArray(item.history) ? item.history.length : 0;
    return `<article class="request-card"><div class="request-card-top"><span class="code">SOL-${String(item.id).padStart(4, '0')}</span>${statusBadge(item.status)}</div><h3>${escapeHtml(item.item)}</h3><p>${escapeHtml(item.reason)}</p><div class="request-meta"><div><span>Solicitante</span><strong>${escapeHtml(item.requester)}</strong></div><div><span>Quantidade</span><strong>${item.quantity} unidade(s)</strong></div><div><span>Setor</span><strong>${escapeHtml(item.department)}</strong></div><div><span>Prioridade</span><strong>${escapeHtml(item.priority)}</strong></div></div>${decision}<div class="request-actions">${actions}<button class="history-button request-history" data-id="${item.id}">Histórico (${historyCount})</button></div></article>`;
  }).join('');
  const pagInfo = state.pagination.requests;
  if (pagInfo && pagInfo.hasMore && filtered.length > 0) {
    requestsHtml += `<div style="text-align: center; padding: 2rem; grid-column: 1/-1;"><button class="button secondary" id="loadMoreRequests">Carregar mais solicitações (${pagInfo.total - state.requests.length} restantes)</button></div>`;
    setTimeout(() => $('#loadMoreRequests')?.addEventListener('click', () => loadMore('requests')), 0);
  }
  $('#requestsGrid').innerHTML = requestsHtml;
  $('#requestsEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.request-approve').forEach((button) => button.addEventListener('click', () => openDecisionModal(Number(button.dataset.id), 'approved')));
  document.querySelectorAll('.request-reject').forEach((button) => button.addEventListener('click', () => openDecisionModal(Number(button.dataset.id), 'rejected')));
  document.querySelectorAll('.request-deliver').forEach((button) => button.addEventListener('click', () => deliverRequest(Number(button.dataset.id))));
  document.querySelectorAll('.request-history').forEach((button) => button.addEventListener('click', () => openRequestHistory(Number(button.dataset.id))));
}

function renderCustody() {
  const search = $('#custodySearch').value.toLowerCase();
  const filter = $('#custodyStatus').value;
  const filtered = state.custody.filter((item) => [item.item, item.code, item.holder, item.department].join(' ').toLowerCase().includes(search) && (filter === 'all' || item.status === filter));
  const activeValue = state.custody.filter((item) => item.status === 'active').reduce((sum, item) => sum + Number(item.value), 0);
  $('#custodyTotalValue').textContent = money(activeValue);
  $('#custodyCards').innerHTML = filtered.map((item) => `<article class="custody-card"><div class="custody-card-top"><div class="asset-icon">${icons.laptop}</div><div><h3>${escapeHtml(item.item)}</h3><span class="asset-code">${escapeHtml(item.code)} · ${escapeHtml(item.department)}</span></div>${statusBadge(item.status === 'active' && isOverdue(item) ? 'overdue' : item.status, 'custody')}</div><div class="custody-details"><div class="detail-block"><span>Responsável</span><strong>${escapeHtml(item.holder)}</strong></div><div class="detail-block"><span>Retirada</span><strong>${dateLabel(item.checkout)}</strong></div><div class="detail-block"><span>${item.status === 'returned' ? 'Devolvido em' : 'Devolver até'}</span><strong>${dateLabel(item.returned || item.expected)}</strong></div></div>${item.notes ? `<p class="custody-note">${escapeHtml(item.notes)}</p>` : ''}<div class="custody-card-footer"><span class="asset-value">Valor registrado: <strong>${money(item.value)}</strong></span><div class="custody-actions"><button class="button small secondary custody-pdf" data-id="${item.id}">${icons.download} Gerar termo PDF</button>${item.status === 'active' && can('manageCustody') ? `<button class="button small secondary return-item" data-id="${item.id}">Registrar devolução</button>` : ''}</div></div></article>`).join('');
  const pagInfo = state.pagination.custody;
  if (pagInfo && pagInfo.hasMore && filtered.length > 0) {
    $('#custodyCards').innerHTML += `<div style="text-align: center; padding: 2rem; grid-column: 1/-1;"><button class="button secondary" id="loadMoreCustody">Carregar mais equipamentos (${pagInfo.total - state.custody.length} restantes)</button></div>`;
    setTimeout(() => $('#loadMoreCustody')?.addEventListener('click', () => loadMore('custody')), 0);
  }
  $('#custodyEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.return-item').forEach((button) => button.addEventListener('click', () => returnCustody(Number(button.dataset.id))));
  document.querySelectorAll('.custody-pdf').forEach((button) => button.addEventListener('click', () => generateCustodyPdf(Number(button.dataset.id))));
}

function renderMovements() {
  const search = $('#movementSearch').value.toLowerCase();
  const type = $('#movementType').value;
  const dateFrom = $('#movementDateFrom').value;
  const dateTo = $('#movementDateTo').value;

  const periodFiltered = state.movements.filter((m) => {
    const d = (m.date || '').slice(0, 10);
    return (type === 'all' || m.type === type) && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
  });
  const filtered = periodFiltered.filter((m) => [m.item, m.code, m.supplier, m.document, m.responsible].join(' ').toLowerCase().includes(search));

  const entries = periodFiltered.filter((m) => m.type === 'entry').reduce((s, m) => s + Number(m.quantity), 0);
  const exits = periodFiltered.filter((m) => m.type === 'exit').reduce((s, m) => s + Number(m.quantity), 0);
  const suppliers = new Set(periodFiltered.filter((m) => m.type === 'entry' && m.supplier).map((m) => m.supplier)).size;
  const hasPeriod = dateFrom || dateTo;
  const periodNote = hasPeriod ? `${dateFrom ? dateLabel(dateFrom) : '...'} a ${dateTo ? dateLabel(dateTo) : '...'}` : '';
  $('#movementStats').innerHTML = `<article><span>Unidades recebidas</span><strong>+${entries}</strong><small>${hasPeriod ? periodNote : 'Entradas documentadas'}</small></article><article><span>Unidades distribuídas</span><strong>-${exits}</strong><small>${hasPeriod ? periodNote : 'Saídas documentadas'}</small></article><article><span>Fornecedores registrados</span><strong>${suppliers}</strong><small>Com histórico de compra</small></article>`;
  let movementHtml = filtered.map((movement) => {
    const actions = can('manageInventory') ? `<button class="row-action danger delete-movement" data-id="${movement.id}" title="Excluir movimentação">${icons.trash}</button>` : '';
    return `<tr><td>${dateLabel(movement.date)}</td><td><span class="movement-type ${movement.type}">${movement.type === 'entry' ? 'Entrada' : 'Saída'}</span></td><td><div class="item-cell"><div class="item-thumb">${escapeHtml(movement.item[0])}</div><div><strong>${escapeHtml(movement.item)}</strong><small>${escapeHtml(movement.code)}</small></div></div></td><td><strong class="movement-quantity ${movement.type}">${movement.type === 'entry' ? '+' : '-'}${movement.quantity}</strong> un.</td><td>${escapeHtml(movement.supplier || '—')}</td><td>${escapeHtml(movement.document || '—')}</td><td>${escapeHtml(movement.responsible)}</td><td><div class="row-actions">${actions}</div></td></tr>`;
  }).join('');
  const pagInfo = state.pagination.movements;
  if (pagInfo && pagInfo.hasMore && filtered.length > 0) {
    movementHtml += `<tr><td colspan="8" style="text-align: center; padding: 1.5rem;"><button class="button secondary" id="loadMoreMovements">Carregar mais movimentações (${pagInfo.total - state.movements.length} restantes)</button></td></tr>`;
    setTimeout(() => $('#loadMoreMovements')?.addEventListener('click', () => loadMore('movements')), 0);
  }
  $('#movementBody').innerHTML = movementHtml;
  $('#movementEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.delete-movement').forEach((button) => button.addEventListener('click', () => deleteMovement(Number(button.dataset.id))));
}

function consumptionSummary(dateFrom, dateTo) {
  const grouped = new Map();
  state.movements
    .filter((item) => item.type === 'exit' && (!dateFrom || (item.date || '').slice(0, 10) >= dateFrom) && (!dateTo || (item.date || '').slice(0, 10) <= dateTo))
    .forEach((item) => grouped.set(item.item, (grouped.get(item.item) || 0) + Number(item.quantity)));
  return [...grouped.entries()].map(([item, quantity]) => ({ item, quantity })).sort((a, b) => b.quantity - a.quantity);
}

function renderReports() {
  const dateFrom = $('#reportDateFrom')?.value || '';
  const dateTo = $('#reportDateTo')?.value || '';

  const inventoryValue = state.inventory.reduce((sum, item) => sum + Number(item.quantity) * Number(item.value), 0);
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const custodyValue = activeCustody.reduce((sum, item) => sum + Number(item.value), 0);
  const periodMovements = state.movements.filter((m) => {
    const d = (m.date || '').slice(0, 10);
    return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
  });
  const consumed = periodMovements.filter((m) => m.type === 'exit').reduce((sum, m) => sum + Number(m.quantity), 0);
  const low = state.inventory.filter((item) => item.quantity <= item.minimum && !custodyIds.has(item.id)).length;
  const periodNote = dateFrom || dateTo ? ` · ${dateFrom ? dateLabel(dateFrom) : '...'} a ${dateTo ? dateLabel(dateTo) : '...'}` : '';
  $('#reportKpis').innerHTML = `<article><span>Valor em inventário</span><strong>${money(inventoryValue)}</strong></article><article><span>Patrimônio em posse</span><strong>${money(custodyValue)}</strong></article><article><span>Unidades consumidas${escapeHtml(periodNote)}</span><strong>${consumed}</strong></article><article><span>Itens para reposição</span><strong>${low}</strong></article>`;

  const consumption = consumptionSummary(dateFrom, dateTo);
  const maxConsumption = Math.max(...consumption.map((item) => item.quantity), 1);
  $('#consumptionReport').innerHTML = consumption.length ? consumption.map((item) => `<div class="report-row"><div><strong>${escapeHtml(item.item)}</strong><span>${item.quantity} unidade(s)</span></div><i><b style="width:${(item.quantity / maxConsumption) * 100}%"></b></i></div>`).join('') : `<div class="empty-state show"><p>Nenhuma saída${periodNote ? ' no período selecionado' : ' registrada'}.</p></div>`;

  const holderGroups = new Map();
  activeCustody.forEach((item) => {
    const current = holderGroups.get(item.holder) || { quantity: 0, value: 0 };
    current.quantity += 1; current.value += Number(item.value); holderGroups.set(item.holder, current);
  });
  const holders = [...holderGroups.entries()].sort((a, b) => b[1].value - a[1].value);
  const maxHolderValue = Math.max(...holders.map(([, item]) => item.value), 1);
  $('#holderReport').innerHTML = holders.length ? holders.map(([holder, data]) => `<div class="report-row"><div><strong>${escapeHtml(holder)}</strong><span>${data.quantity} bem(ns) · ${money(data.value)}</span></div><i><b style="width:${(data.value / maxHolderValue) * 100}%"></b></i></div>`).join('') : '<div class="empty-state show"><p>Nenhum patrimônio em posse.</p></div>';

  $('#reportInventoryBody').innerHTML = state.inventory.map((item) => {
    const situation = custodyIds.has(item.id) ? '<span class="status blue">Em posse</span>' : item.quantity <= item.minimum ? '<span class="status amber">Repor</span>' : '<span class="status green">Regular</span>';
    return `<tr><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)}</small></td><td>${escapeHtml(item.category)}</td><td>${item.quantity} un.</td><td>${item.minimum} un.</td><td>${money(item.quantity * item.value)}</td><td>${situation}</td></tr>`;
  }).join('');
}

function renderAll() { renderDashboard(); renderInventory(); renderMovements(); renderRequests(); renderCustody(); renderReports(); }

function navigate(page) {
  if (!canOpenPage(page)) { showToast('Seu perfil não possui acesso a esta área.'); return; }
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.page === page));
  $(`#${page}Page`).classList.add('active');
  const names = { dashboard: 'Visão geral', inventory: 'Materiais e equipamentos', movements: 'Movimentações', requests: 'Solicitações', custody: 'Termos de posse', reports: 'Relatórios' };
  $('#breadcrumbTitle').textContent = names[page];
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'dashboard') window.requestAnimationFrame(renderCharts);
}

function setLoading(loading) {
  const btn = $('#submitModal');
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = icons.spinner + ' Aguarde…';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || 'Salvar';
  }
}

function showToast(message) {
  $('#toastMessage').textContent = message;
  $('#toast').classList.add('show');
  window.setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

function openModal({ eyebrow, title, submitLabel, body, action, hideSubmit = false }) {
  $('#modalEyebrow').textContent = eyebrow;
  $('#modalTitle').textContent = title;
  $('#submitModal').textContent = submitLabel;
  $('#submitModal').hidden = hideSubmit;
  $('#cancelModal').textContent = hideSubmit ? 'Fechar' : 'Cancelar';
  $('#modalBody').innerHTML = body;
  modalAction = action;
  $('#modalBackdrop').classList.add('open');
  $('#modalBackdrop').setAttribute('aria-hidden', 'false');
  window.setTimeout(() => $('#modalBody').querySelector('input, select, textarea')?.focus(), 50);
}

function closeModal() {
  $('#modalBackdrop').classList.remove('open');
  $('#modalBackdrop').setAttribute('aria-hidden', 'true');
  modalAction = null;
  $('#submitModal').hidden = false;
  $('#submitModal').className = 'button primary';
  $('#submitModal').textContent = 'Salvar';
  $('#cancelModal').textContent = 'Cancelar';
  $('#modalForm').reset();
}

function showConfirm({ title, message, confirmLabel = 'Confirmar', danger = false, onConfirm }) {
  openModal({
    eyebrow: 'CONFIRMAÇÃO',
    title,
    submitLabel: confirmLabel,
    body: `<p style="color: var(--muted); font-size: 13px; line-height: 1.6;">${escapeHtml(message)}</p>`,
    action: async () => {
      closeModal();
      if (onConfirm) await onConfirm();
    }
  });
  if (danger) {
    $('#submitModal').classList.add('danger');
    $('#submitModal').classList.remove('primary');
  }
}

function openAlerts() {
  const alerts = getAlerts();
  const body = alerts.length ? `<div class="notification-list">${alerts.map((alert) => `<button type="button" class="notification-item" data-alert-page="${alert.page}"><span class="notification-symbol ${alert.type}">!</span><div><strong>${escapeHtml(alert.title)}</strong><p>${escapeHtml(alert.detail)}</p></div><b>${escapeHtml(alert.badge)}</b></button>`).join('')}</div>` : '<div class="empty-state show"><span data-icon="check"></span><h3>Nenhuma pendência</h3><p>Não há alertas ativos no momento.</p></div>';
  openModal({ eyebrow: 'CENTRAL DE ALERTAS', title: `${alerts.length} pendência(s) ativa(s)`, submitLabel: '', hideSubmit: true, body, action: null });
  document.querySelectorAll('.notification-item').forEach((button) => button.addEventListener('click', () => { closeModal(); navigate(button.dataset.alertPage); }));
}

async function openMovementModal() {
  if (!can('manageInventory')) { showToast('Seu perfil não pode registrar movimentações.'); return; }
  const options = state.inventory.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · Saldo: ${item.quantity}</option>`).join('');
  openModal({ eyebrow: 'CONTROLE DE ESTOQUE', title: 'Registrar movimentação', submitLabel: 'Confirmar movimentação', body: `<div class="form-grid"><div class="field full"><label for="movementItem">Item *</label><select id="movementItem" name="inventoryId" required><option value="">Selecione o item</option>${options}</select></div><div class="field"><label for="movementKind">Tipo *</label><select id="movementKind" name="type" required><option value="entry">Entrada</option><option value="exit">Saída</option></select></div><div class="field"><label for="movementQuantity">Quantidade *</label><input id="movementQuantity" name="quantity" type="number" min="1" value="1" required /></div><div class="field"><label for="movementDate">Data *</label><input id="movementDate" name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required /></div><div class="field"><label for="movementSupplier">Fornecedor ou destino *</label><input id="movementSupplier" name="supplier" required placeholder="Empresa, setor ou pessoa" /></div><div class="field"><label for="movementDocument">Nota fiscal / documento</label><input id="movementDocument" name="document" placeholder="Ex.: NF-2031 ou REQ-0102" /></div><div class="field"><label for="movementResponsible">Responsável</label><input id="movementResponsible" name="responsible" readonly value="${escapeHtml(currentUser.name)}" /></div><div class="field full"><label for="movementNotes">Observações</label><textarea id="movementNotes" name="notes" placeholder="Motivo, condição recebida ou informações adicionais."></textarea></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    const item = state.inventory.find((entry) => entry.id === Number(data.inventoryId));
    const quantity = Number(data.quantity);
    if (!item || quantity < 1) return;
    if (data.type === 'exit' && quantity > item.quantity) { showToast(`Saldo insuficiente. Disponível: ${item.quantity} unidade(s).`); return; }
    try {
      const movement = await apiPost('/movements', { inventoryId: item.id, type: data.type, quantity, date: data.date, supplier: data.supplier, document: data.document, notes: data.notes });
      item.quantity += data.type === 'entry' ? quantity : -quantity;
      state.movements.unshift(movement);
      addActivity(data.type === 'entry' ? 'Entrada de estoque registrada' : 'Saída de estoque registrada', `${item.name} · ${quantity} unidade(s) · ${currentUser.name}`);
      closeModal(); renderAll(); navigate('movements'); showToast('Movimentação registrada e saldo atualizado.');
    } catch (err) { showToast(err.message); }
  } });
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

async function openRequestModal() {
  if (!can('request')) { showToast('Seu perfil não pode criar solicitações.'); return; }
  const options = state.inventory.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('');
  openModal({ eyebrow: 'NOVO PEDIDO', title: 'Solicitar material ou equipamento', submitLabel: 'Enviar solicitação', body: `<div class="form-grid"><div class="field full"><label for="requestItem">Item solicitado *</label><input id="requestItem" name="item" list="inventoryOptions" required placeholder="Digite ou selecione um item"/><datalist id="inventoryOptions">${options}</datalist></div><div class="field"><label for="requester">Solicitante *</label><input id="requester" name="requester" required readonly value="${escapeHtml(currentUser.name)}"/></div><div class="field"><label for="requestDepartment">Setor *</label><input id="requestDepartment" name="department" required readonly value="${escapeHtml(currentUser.department)}"/></div><div class="field"><label for="requestQuantity">Quantidade *</label><input id="requestQuantity" name="quantity" type="number" min="1" value="1" required/></div><div class="field"><label for="requestPriority">Prioridade</label><select id="requestPriority" name="priority"><option>Normal</option><option>Alta</option><option>Urgente</option></select></div><div class="field full"><label for="requestReason">Motivo da solicitação *</label><textarea id="requestReason" name="reason" required placeholder="Explique brevemente a necessidade."></textarea></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    try {
      const created = await apiPost('/requests', { ...data, quantity: Number(data.quantity), priority: data.priority || 'Normal' });
      state.requests.unshift(created);
      addActivity('Nova solicitação criada', `${data.requester} pediu ${data.quantity} unidade(s) de ${data.item}`);
      closeModal(); renderAll(); navigate('requests'); showToast('Solicitação enviada para análise.');
    } catch (err) { showToast(err.message); }
  } });
}

function openItemModal(id = null) {
  if (!can('manageInventory')) { showToast('Seu perfil não pode alterar o inventário.'); return; }
  const item = state.inventory.find((entry) => entry.id === id) || {};
  openModal({ eyebrow: id ? 'ATUALIZAR CADASTRO' : 'NOVO CADASTRO', title: id ? 'Editar item' : 'Cadastrar material ou equipamento', submitLabel: id ? 'Salvar alterações' : 'Cadastrar item', body: `<div class="form-grid"><div class="field full"><label for="itemName">Nome do item *</label><input id="itemName" name="name" required value="${escapeHtml(item.name || '')}" placeholder="Ex.: Monitor Dell 24 polegadas"/></div><div class="field"><label for="itemCode">Código *</label><input id="itemCode" name="code" required value="${escapeHtml(item.code || '')}" placeholder="MAT-001 ou PAT-001"/></div><div class="field"><label for="itemCategory">Categoria *</label><input id="itemCategory" name="category" required value="${escapeHtml(item.category || '')}" placeholder="Ex.: Informática"/></div><div class="field"><label for="itemLocation">Localização *</label><input id="itemLocation" name="location" required value="${escapeHtml(item.location || '')}" placeholder="Ex.: Armário A"/></div><div class="field"><label for="itemValue">Valor unitário (R$)</label><input id="itemValue" name="value" type="number" min="0" step="0.01" value="${item.value || 0}"/></div><div class="field"><label for="itemQuantity">Quantidade atual *</label><input id="itemQuantity" name="quantity" type="number" min="0" required value="${item.quantity ?? 1}"/></div><div class="field"><label for="itemMinimum">Estoque mínimo *</label><input id="itemMinimum" name="minimum" type="number" min="0" required value="${item.minimum ?? 1}"/></div><div class="field full"><label><input name="valuable" type="checkbox" ${item.valuable ? 'checked' : ''}/> Item de valor que exige termo de posse</label><small>Use para notebooks, celulares, monitores e outros bens patrimoniais.</small></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    try {
      const payload = { ...data, id: id || undefined, quantity: Number(data.quantity), minimum: Number(data.minimum), value: Number(data.value), valuable: Boolean(data.valuable) };
      let saved;
      if (id) {
        saved = await apiPut(`/inventory/${id}`, payload);
        state.inventory = state.inventory.map((entry) => entry.id === id ? saved : entry);
        addActivity('Cadastro atualizado', `${saved.name} · ${saved.quantity} unidade(s)`);
      } else {
        saved = await apiPost('/inventory', payload);
        state.inventory.unshift(saved);
        addActivity('Novo item cadastrado', `${saved.name} · ${saved.quantity} unidade(s)`);
      }
      closeModal(); renderAll(); showToast(id ? 'Item atualizado.' : 'Item cadastrado no inventário.');
    } catch (err) { showToast(err.message); }
  } });
}

async function deleteInventoryItem(id) {
  if (!can('manageInventory')) { showToast('Seu perfil não pode excluir itens.'); return; }
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) return;
  showConfirm({
    title: 'Excluir item',
    message: `Tem certeza que deseja excluir ${item.name}? Itens com movimentações ou termos vinculados serão bloqueados para preservar o histórico.`,
    confirmLabel: 'Excluir item',
    danger: true,
    onConfirm: async () => {
      try {
        await apiDelete(`/inventory/${id}`);
        state.inventory = state.inventory.filter((entry) => entry.id !== id);
        await loadState();
        renderAll();
        showToast('Item excluído do inventário.');
      } catch (err) { showToast(err.message); }
    }
  });
}

async function deleteMovement(id) {
  if (!can('manageInventory')) { showToast('Seu perfil não pode excluir movimentações.'); return; }
  const movement = state.movements.find((entry) => entry.id === id);
  if (!movement) return;
  showConfirm({
    title: 'Excluir movimentação',
    message: `Tem certeza que deseja excluir a movimentação de ${movement.item}? O saldo do estoque será ajustado automaticamente.`,
    confirmLabel: 'Excluir movimentação',
    danger: true,
    onConfirm: async () => {
      try {
        await apiDelete(`/movements/${id}`);
        await loadState();
        renderAll();
        showToast('Movimentação excluída e saldo recalculado.');
      } catch (err) { showToast(err.message); }
    }
  });
}

async function openCustodyModal() {
  if (!can('manageCustody')) { showToast('Seu perfil não pode registrar retiradas.'); return; }
  const available = state.inventory.filter((item) => item.valuable && !state.custody.some((record) => record.inventory_id === item.id && record.status === 'active'));
  const options = available.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(item.code)}</option>`).join('');
  openModal({ eyebrow: 'RESPONSABILIDADE', title: 'Registrar retirada de equipamento', submitLabel: 'Registrar retirada', body: `<div class="form-grid"><div class="field full"><label for="custodyItem">Equipamento *</label><select id="custodyItem" name="inventoryId" required><option value="">Selecione o bem</option>${options}</select>${available.length ? '' : '<small>Não há itens de valor disponíveis. Cadastre ou devolva um equipamento.</small>'}</div><div class="field"><label for="holder">Responsável *</label><input id="holder" name="holder" required placeholder="Nome completo"/></div><div class="field"><label for="holderDepartment">Setor *</label><input id="holderDepartment" name="department" required placeholder="Ex.: Diretoria"/></div><div class="field"><label for="checkout">Data da retirada *</label><input id="checkout" name="checkout" type="date" value="${new Date().toISOString().slice(0, 10)}" required/></div><div class="field"><label for="expected">Previsão de devolução *</label><input id="expected" name="expected" type="date" required/></div><div class="field full"><label for="custodyNotes">Estado e observações</label><textarea id="custodyNotes" name="notes" placeholder="Acessórios entregues, estado de conservação e finalidade."></textarea></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    const item = state.inventory.find((entry) => entry.id === Number(data.inventoryId));
    if (!item) { showToast('Selecione um equipamento disponível.'); return; }
    try {
      const record = await apiPost('/custody', { inventoryId: item.id, holder: data.holder, department: data.department, checkout: data.checkout, expected: data.expected, notes: data.notes });
      state.custody.unshift(record);
      item.location = 'Em posse';
      addActivity('Retirada registrada', `${item.name} entregue para ${data.holder}`);
      closeModal(); renderAll(); showToast('Termo de posse registrado.');
    } catch (err) { showToast(err.message); }
  } });
}

async function registerRequestAction(request, status, note) {
  try {
    let updated;
    if (status === 'approved') updated = await apiPut(`/requests/${request.id}/approve`, { note });
    else if (status === 'rejected') updated = await apiPut(`/requests/${request.id}/reject`, { note });
    else if (status === 'delivered') updated = await apiPut(`/requests/${request.id}/deliver`);
    else return;
    Object.assign(request, updated);
    renderAll();
  } catch (err) { showToast(err.message); }
}

function openDecisionModal(id, status) {
  if (!can('approve')) { showToast('Seu perfil não pode analisar solicitações.'); return; }
  const request = state.requests.find((item) => item.id === id);
  if (!request || request.status !== 'pending') return;
  const approving = status === 'approved';
  openModal({ eyebrow: 'DECISÃO AUDITÁVEL', title: approving ? 'Aprovar solicitação' : 'Recusar solicitação', submitLabel: approving ? 'Confirmar aprovação' : 'Confirmar recusa', body: `<div class="permission-note"><strong>${escapeHtml(request.item)}</strong><br>${request.quantity} unidade(s) · ${escapeHtml(request.requester)}</div><div class="field"><label for="decisionNote">Justificativa da decisão *</label><textarea id="decisionNote" name="note" required minlength="5" placeholder="Registre o motivo para manter a decisão documentada."></textarea><small>A decisão será vinculada a ${escapeHtml(currentUser.name)}.</small></div>`, action: async (form) => {
    const note = new FormData(form).get('note').trim();
    if (note.length < 5) return;
    await registerRequestAction(request, status, note);
    closeModal();
    showToast(approving ? 'Solicitação aprovada e documentada.' : 'Solicitação recusada e documentada.');
  } });
}

async function deliverRequest(id) {
  if (!can('approve')) { showToast('Seu perfil não pode registrar entregas.'); return; }
  const request = state.requests.find((item) => item.id === id);
  if (!request || request.status !== 'approved') return;
  const inventoryItem = state.inventory.find((item) => item.name.toLowerCase() === request.item.toLowerCase());
  if (inventoryItem && inventoryItem.quantity < request.quantity) { showToast(`Saldo insuficiente. Disponível: ${inventoryItem.quantity} unidade(s).`); return; }
  showConfirm({
    title: 'Confirmar entrega',
    message: `Tem certeza que deseja marcar a entrega de ${request.item} para ${request.requester} como concluída? Esta ação dará baixa no estoque automaticamente.`,
    confirmLabel: 'Confirmar entrega',
    danger: true,
    onConfirm: async () => {
      try {
        const updated = await apiPut(`/requests/${id}/deliver`);
        Object.assign(request, updated);
        if (inventoryItem) {
          inventoryItem.quantity -= request.quantity;
          const mov = await apiGet('/movements');
          state.movements = mov.data || mov;
          if (mov.total) {
            state.pagination.movements = { total: mov.total, limit: mov.limit, offset: mov.offset, hasMore: mov.hasMore };
          }
        }
        addActivity('Material entregue', `${request.item} entregue para ${request.requester}`);
        renderAll();
        showToast('Entrega registrada no histórico.');
      } catch (err) { showToast(err.message); }
    }
  });
}

async function openRequestHistory(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return;
  let history = request.history;
  if (!history || !history.length) {
    try { history = await apiGet(`/requests/${id}/history`); } catch {}
  }
  const entries = [...(history || [])].reverse().map((entry) => {
    const date = new Date(entry.date);
    return `<div class="audit-entry"><strong>${escapeHtml(entry.label)}</strong><span>${escapeHtml(entry.user_name || entry.user)}${entry.user_role ? ` · ${escapeHtml(entry.user_role)}` : ''} · ${date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}</div>`;
  }).join('');
  openModal({ eyebrow: `SOL-${String(request.id).padStart(4, '0')}`, title: `Histórico · ${request.item}`, submitLabel: '', hideSubmit: true, body: `<div class="audit-list">${entries || '<p>Nenhum evento registrado.</p>'}</div>`, action: null });
}

async function returnCustody(id) {
  if (!can('manageCustody')) { showToast('Seu perfil não pode registrar devoluções.'); return; }
  const record = state.custody.find((item) => item.id === id);
  if (!record) return;
  showConfirm({
    title: 'Registrar devolução',
    message: `Tem certeza que deseja registrar a devolução de ${record.item} por ${record.holder}? O equipamento voltará ao inventário como disponível.`,
    confirmLabel: 'Confirmar devolução',
    danger: true,
    onConfirm: async () => {
      try {
        const updated = await apiPut(`/custody/${id}/return`);
        Object.assign(record, updated);
        const item = state.inventory.find((entry) => entry.id === record.inventory_id);
        if (item) item.location = 'Armário de equipamentos';
        addActivity('Equipamento devolvido', `${record.item} devolvido por ${record.holder}`);
        renderAll(); showToast('Devolução registrada no histórico.');
      } catch (err) { showToast(err.message); }
    }
  });
}

async function startSession(user) {
  currentUser = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
  sessionStorage.setItem(sessionKey, JSON.stringify(currentUser));
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('auth-hidden');
  $('#loginError').textContent = '';
  await loadState();
  applyPermissions();
  renderAll();
  window.requestAnimationFrame(renderCharts);
}

function endSession() {
  clearToken();
  currentUser = null;
  state = { inventory: [], requests: [], custody: [], movements: [], activity: [] };
  $('#appShell').classList.add('auth-hidden');
  $('#loginScreen').classList.remove('hidden');
  $('#loginForm').reset();
  $('#loginEmail').focus();
}

function applyPermissions() {
  const requesterOnly = currentUser?.role === 'requester';
  document.querySelectorAll('.nav-item').forEach((button) => { button.hidden = !canOpenPage(button.dataset.page); });
  document.querySelectorAll('.quick-request').forEach((button) => { button.hidden = !can('request'); });
  $('#newItemButton').hidden = !can('manageInventory');
  $('#newMovementButton').hidden = !can('manageInventory');
  $('#newCustodyButton').hidden = !can('manageCustody');
  $('#exportReportButton').hidden = !can('viewReports');
  $('#currentUserName').textContent = currentUser?.name || '';
  $('#currentUserRole').textContent = roleLabels[currentUser?.role] || '';
  $('#userAvatar').textContent = initials(currentUser?.name || 'DFA');
  if (requesterOnly) navigate('requests');
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
      '',
      '',
      '',
      movement.notes || '',
      '',
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

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  const emptyEl = document.getElementById('categoryEmpty');
  if (!canvas || !canvas.offsetWidth) return;
  const catMap = new Map();
  state.inventory.forEach((item) => catMap.set(item.category, (catMap.get(item.category) || 0) + Number(item.quantity)));
  const items = [...catMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  if (!items.length) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  canvas.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  const { ctx, w, h } = setupCanvas(canvas);
  const maxVal = Math.max(...items.map((i) => i.value));
  const padL = 106, padR = 36, padT = 10, padB = 10;
  const barH = Math.min(20, (h - padT - padB) / items.length - 5);
  const gap = ((h - padT - padB) - items.length * barH) / (items.length + 1);
  items.forEach((item, i) => {
    const y = padT + gap * (i + 1) + barH * i;
    const availW = w - padL - padR;
    const barW = maxVal > 0 ? (availW * item.value) / maxVal : 0;
    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = '10px Mulish, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(item.label.length > 13 ? item.label.slice(0, 12) + '…' : item.label, padL - 8, y + barH / 2);
    ctx.fillStyle = 'rgba(219,164,81,0.1)';
    ctx.fillRect(padL, y, availW, barH);
    if (barW > 0) {
      const grad = ctx.createLinearGradient(padL, 0, padL + barW, 0);
      grad.addColorStop(0, 'rgba(219,164,81,0.65)'); grad.addColorStop(1, '#F5B458');
      ctx.fillStyle = grad;
      ctx.fillRect(padL, y, barW, barH);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 9px Mulish, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(String(item.value), padL + barW + 5, y + barH / 2);
  });
}

function renderMovementChart() {
  const canvas = document.getElementById('movementChart');
  if (!canvas || !canvas.offsetWidth) return;
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').slice(0, 3).toUpperCase(), entries: 0, exits: 0 };
  });
  state.movements.forEach((m) => {
    const month = months.find((mo) => mo.key === (m.date || '').slice(0, 7));
    if (month) { if (m.type === 'entry') month.entries += Number(m.quantity); else month.exits += Number(m.quantity); }
  });
  const { ctx, w, h } = setupCanvas(canvas);
  const maxVal = Math.max(...months.flatMap((m) => [m.entries, m.exits]), 1);
  const padL = 30, padR = 10, padT = 10, padB = 28;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH * i) / 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    if (i < 4) {
      const val = Math.round(maxVal * (1 - i / 4));
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = '8px Mulish, sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(String(val), padL - 3, y);
    }
  }
  const colW = chartW / months.length;
  const barW = Math.min(13, colW * 0.3);
  months.forEach((month, i) => {
    const x = padL + colW * i + colW / 2;
    if (month.entries > 0) { const bh = (chartH * month.entries) / maxVal; ctx.fillStyle = '#3a9e74'; ctx.fillRect(x - barW - 1.5, padT + chartH - bh, barW, bh); }
    if (month.exits > 0) { const bh = (chartH * month.exits) / maxVal; ctx.fillStyle = '#DBA451'; ctx.fillRect(x + 1.5, padT + chartH - bh, barW, bh); }
    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '8px Mulish, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(month.label, x, padT + chartH + 8);
  });
}

function renderRequestChart() {
  const canvas = document.getElementById('requestChart');
  if (!canvas || !canvas.offsetWidth) return;
  const segments = [
    { label: 'Pendentes', key: 'pending', color: '#DBA451' },
    { label: 'Aprovadas', key: 'approved', color: '#4a9dcc' },
    { label: 'Entregues', key: 'delivered', color: '#3a9e74' },
    { label: 'Recusadas', key: 'rejected', color: '#d8624e' },
  ].map((s) => ({ ...s, count: state.requests.filter((r) => r.status === s.key).length })).filter((s) => s.count > 0);
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const { ctx, w, h } = setupCanvas(canvas);
  if (!total) {
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = '11px Mulish, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Nenhuma solicitação registrada', w / 2, h / 2);
    return;
  }
  const legendW = 112;
  const donutD = Math.min(w - legendW - 20, h) - 14;
  const cx = donutD / 2 + 7, cy = h / 2;
  const outerR = donutD / 2, innerR = outerR * 0.58;
  let angle = -Math.PI / 2;
  segments.forEach((seg) => {
    const slice = (2 * Math.PI * seg.count) / total;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, outerR, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = seg.color; ctx.fill();
    angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, 2 * Math.PI); ctx.fillStyle = '#1b1b1b'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 20px Manrope, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(total), cx, cy - 7);
  ctx.fillStyle = 'rgba(255,255,255,0.36)'; ctx.font = '8.5px Mulish, sans-serif';
  ctx.fillText('total', cx, cy + 10);
  const legendX = donutD + 20;
  const startY = cy - (segments.length * 22) / 2;
  segments.forEach((seg, i) => {
    const y = startY + i * 22;
    ctx.fillStyle = seg.color; ctx.beginPath(); ctx.arc(legendX + 5, y + 5, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.58)'; ctx.font = '9.5px Mulish, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(seg.label, legendX + 14, y);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 10.5px Mulish, sans-serif';
    ctx.fillText(String(seg.count), legendX + 14, y + 12);
  });
}

function renderCharts() {
  renderCategoryChart();
  renderMovementChart();
  renderRequestChart();
}

document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.go)));
document.querySelectorAll('.quick-request').forEach((button) => button.addEventListener('click', openRequestModal));
$('#newItemButton').addEventListener('click', () => openItemModal());
$('#newMovementButton').addEventListener('click', openMovementModal);
$('#newCustodyButton').addEventListener('click', openCustodyModal);
$('#notificationButton').addEventListener('click', openAlerts);
$('#exportReportButton').addEventListener('click', exportReportsPdf);
$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#closeModal').addEventListener('click', closeModal);
$('#cancelModal').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', (event) => { if (event.target === $('#modalBackdrop')) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
$('#modalForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!modalAction) return;
  const form = event.currentTarget;
  const errors = validateForm(form);
  if (errors.length) {
    showToast(errors[0].message);
    return;
  }
  setLoading(true);
  try {
    await modalAction(form);
  } catch (err) {
    showToast(err.message || 'Erro ao processar. Tente novamente.');
  } finally {
    setLoading(false);
  }
});
['inventorySearch', 'inventoryCategory', 'inventoryStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'inventorySearch' ? 'input' : 'change', renderInventory));
['movementSearch', 'movementType'].forEach((id) => $(`#${id}`).addEventListener(id === 'movementSearch' ? 'input' : 'change', renderMovements));
['movementDateFrom', 'movementDateTo'].forEach((id) => $(`#${id}`).addEventListener('change', renderMovements));
['custodySearch', 'custodyStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'custodySearch' ? 'input' : 'change', renderCustody));
$('#exportMovementCsv').addEventListener('click', exportMovementsCsv);
$('#exportInventoryCsv').addEventListener('click', exportInventoryCsv);
$('#exportFinancialCsv').addEventListener('click', exportFinancialCsv);
$('#reportDateFrom').addEventListener('change', renderReports);
$('#reportDateTo').addEventListener('change', renderReports);
$('#clearReportDates').addEventListener('click', () => { $('#reportDateFrom').value = ''; $('#reportDateTo').value = ''; renderReports(); });
$('#requestTabs').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  activeRequestFilter = button.dataset.filter;
  document.querySelectorAll('#requestTabs button').forEach((item) => item.classList.toggle('active', item === button));
  renderRequests();
});

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const emailError = validateField('email', data.email);
  if (emailError || !data.password) {
    $('#loginError').textContent = emailError || 'Senha é obrigatória.';
    return;
  }
  $('#loginError').textContent = '';
  try {
    const result = await apiPost('/auth/login', { email: data.email, password: data.password });
    setToken(result.token);
    await startSession(result.user);
  } catch {
    $('#loginError').textContent = 'E-mail ou senha inválidos.';
  }
});

// Offline detection
function updateOnlineStatus() {
  const banner = $('#offlineBanner');
  if (!navigator.onLine) {
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', async () => {
  const email = button.dataset.demo === 'admin' ? 'admin@dfa.com'
    : button.dataset.demo === 'manager' ? 'gestor@dfa.com'
    : button.dataset.demo === 'requester' ? 'colaborador@dfa.com'
    : 'consulta@dfa.com';
  $('#loginEmail').value = email;
  $('#loginPassword').value = email === 'admin@dfa.com' ? 'admin123'
    : email === 'gestor@dfa.com' ? 'gestor123'
    : email === 'colaborador@dfa.com' ? 'solicitar123'
    : 'consulta123';
  $('#loginError').textContent = '';
  $('#loginPassword').focus();
}));

$('#logoutButton').addEventListener('click', endSession);

$('#todayLabel').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());

const savedUser = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
const savedToken = getToken();
if (savedUser && savedToken) {
  currentUser = savedUser;
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('auth-hidden');
  applyPermissions();
  loadState().then(() => { renderAll(); window.requestAnimationFrame(renderCharts); });
} else {
  endSession();
}
