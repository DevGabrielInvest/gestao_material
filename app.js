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
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const isOverdue = (record) => record.status === 'active' && new Date(`${record.expected}T23:59:59`) < new Date();

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

let state = { inventory: [], requests: [], custody: [], movements: [], activity: [] };

const sessionKey = 'dfa-session-v2';
const tokenKey = 'dfa-token-v2';

function getToken() { return sessionStorage.getItem(tokenKey); }
function setToken(token) { sessionStorage.setItem(tokenKey, token); }
function clearToken() { sessionStorage.removeItem(tokenKey); sessionStorage.removeItem(sessionKey); }

async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

const apiGet = (path) => api(path);
const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
const apiPut = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });

async function loadState() {
  try {
    const results = await Promise.all([
      apiGet('/inventory'),
      apiGet('/requests'),
      apiGet('/custody'),
      apiGet('/movements'),
      apiGet('/activity'),
    ]);
    state.inventory = results[0];
    state.requests = results[1];
    state.custody = results[2];
    state.movements = results[3];
    state.activity = results[4];
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
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
    const actions = can('manageInventory') ? `<button class="row-action edit-item" data-id="${item.id}" title="Editar item">${icons.edit}</button>` : '';
    return `<tr><td><div class="item-cell"><div class="item-thumb">${escapeHtml(item.name[0])}</div><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)} · ${money(item.value)}</small></div></div></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.location)}</td><td><span class="quantity ${low ? 'low' : ''}">${item.quantity}</span> <small>un.</small></td><td>${badge}</td><td><div class="row-actions">${actions}</div></td></tr>`;
  }).join('');
  $('#inventoryEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.edit-item').forEach((button) => button.addEventListener('click', () => openItemModal(Number(button.dataset.id))));
}

function renderRequests() {
  const visible = visibleRequests();
  const pending = visible.filter((item) => item.status === 'pending').length;
  $('#allRequestCount').textContent = visible.length;
  $('#pendingRequestCount').textContent = pending;
  $('#requestNavCount').textContent = pending;
  $('#requestPermissionNote').textContent = can('approve') ? 'Você pode analisar pedidos. Toda aprovação ou recusa exige justificativa e fica registrada no histórico.' : currentUser?.role === 'requester' ? 'Você está visualizando apenas as solicitações criadas pela sua conta.' : 'Perfil de consulta: pedidos e históricos estão disponíveis somente para leitura.';
  const filtered = activeRequestFilter === 'all' ? visible : visible.filter((item) => item.status === activeRequestFilter);
  $('#requestsGrid').innerHTML = filtered.map((item) => {
    const decisionNote = item.decision_note;
    const decision = decisionNote ? `<div class="approval-record"><span>${escapeHtml(item.decided_by || 'Administração')} · ${dateLabel((item.decided_at || '').slice(0, 10))}</span><p>${escapeHtml(decisionNote)}</p></div>` : '';
    let actions = `<span class="asset-value">Solicitado em ${dateLabel(item.date)}</span>`;
    if (can('approve') && item.status === 'pending') actions = `<button class="button small primary request-approve" data-id="${item.id}">Aprovar</button><button class="button small danger request-reject" data-id="${item.id}">Recusar</button>`;
    if (can('approve') && item.status === 'approved') actions = `<button class="button small primary request-deliver" data-id="${item.id}">Marcar como entregue</button>`;
    const historyCount = Array.isArray(item.history) ? item.history.length : 0;
    return `<article class="request-card"><div class="request-card-top"><span class="code">SOL-${String(item.id).padStart(4, '0')}</span>${statusBadge(item.status)}</div><h3>${escapeHtml(item.item)}</h3><p>${escapeHtml(item.reason)}</p><div class="request-meta"><div><span>Solicitante</span><strong>${escapeHtml(item.requester)}</strong></div><div><span>Quantidade</span><strong>${item.quantity} unidade(s)</strong></div><div><span>Setor</span><strong>${escapeHtml(item.department)}</strong></div><div><span>Prioridade</span><strong>${escapeHtml(item.priority)}</strong></div></div>${decision}<div class="request-actions">${actions}<button class="history-button request-history" data-id="${item.id}">Histórico (${historyCount})</button></div></article>`;
  }).join('');
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
  $('#custodyEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.return-item').forEach((button) => button.addEventListener('click', () => returnCustody(Number(button.dataset.id))));
  document.querySelectorAll('.custody-pdf').forEach((button) => button.addEventListener('click', () => generateCustodyPdf(Number(button.dataset.id))));
}

function renderMovements() {
  const search = $('#movementSearch').value.toLowerCase();
  const type = $('#movementType').value;
  const filtered = state.movements.filter((movement) => [movement.item, movement.code, movement.supplier, movement.document, movement.responsible].join(' ').toLowerCase().includes(search) && (type === 'all' || movement.type === type));
  const entries = state.movements.filter((item) => item.type === 'entry').reduce((sum, item) => sum + Number(item.quantity), 0);
  const exits = state.movements.filter((item) => item.type === 'exit').reduce((sum, item) => sum + Number(item.quantity), 0);
  const suppliers = new Set(state.movements.filter((item) => item.type === 'entry' && item.supplier).map((item) => item.supplier)).size;
  $('#movementStats').innerHTML = `<article><span>Unidades recebidas</span><strong>+${entries}</strong><small>Entradas documentadas</small></article><article><span>Unidades distribuídas</span><strong>-${exits}</strong><small>Saídas documentadas</small></article><article><span>Fornecedores registrados</span><strong>${suppliers}</strong><small>Com histórico de compra</small></article>`;
  $('#movementBody').innerHTML = filtered.map((movement) => `<tr><td>${dateLabel(movement.date)}</td><td><span class="movement-type ${movement.type}">${movement.type === 'entry' ? 'Entrada' : 'Saída'}</span></td><td><div class="item-cell"><div class="item-thumb">${escapeHtml(movement.item[0])}</div><div><strong>${escapeHtml(movement.item)}</strong><small>${escapeHtml(movement.code)}</small></div></div></td><td><strong class="movement-quantity ${movement.type}">${movement.type === 'entry' ? '+' : '-'}${movement.quantity}</strong> un.</td><td>${escapeHtml(movement.supplier || '—')}</td><td>${escapeHtml(movement.document || '—')}</td><td>${escapeHtml(movement.responsible)}</td></tr>`).join('');
  $('#movementEmpty').classList.toggle('show', !filtered.length);
}

function consumptionSummary() {
  const grouped = new Map();
  state.movements.filter((item) => item.type === 'exit').forEach((item) => grouped.set(item.item, (grouped.get(item.item) || 0) + Number(item.quantity)));
  return [...grouped.entries()].map(([item, quantity]) => ({ item, quantity })).sort((a, b) => b.quantity - a.quantity);
}

function renderReports() {
  const inventoryValue = state.inventory.reduce((sum, item) => sum + Number(item.quantity) * Number(item.value), 0);
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const custodyValue = activeCustody.reduce((sum, item) => sum + Number(item.value), 0);
  const consumed = state.movements.filter((item) => item.type === 'exit').reduce((sum, item) => sum + Number(item.quantity), 0);
  const low = state.inventory.filter((item) => item.quantity <= item.minimum && !custodyIds.has(item.id)).length;
  $('#reportKpis').innerHTML = `<article><span>Valor em inventário</span><strong>${money(inventoryValue)}</strong></article><article><span>Patrimônio em posse</span><strong>${money(custodyValue)}</strong></article><article><span>Unidades consumidas</span><strong>${consumed}</strong></article><article><span>Itens para reposição</span><strong>${low}</strong></article>`;

  const consumption = consumptionSummary();
  const maxConsumption = Math.max(...consumption.map((item) => item.quantity), 1);
  $('#consumptionReport').innerHTML = consumption.length ? consumption.map((item) => `<div class="report-row"><div><strong>${escapeHtml(item.item)}</strong><span>${item.quantity} unidade(s)</span></div><i><b style="width:${(item.quantity / maxConsumption) * 100}%"></b></i></div>`).join('') : '<div class="empty-state show"><p>Nenhuma saída registrada.</p></div>';

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
  $('#cancelModal').textContent = 'Cancelar';
  $('#modalForm').reset();
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
  if (!request || request.status !== 'approved' || !window.confirm(`Confirmar a entrega de ${request.item} para ${request.requester}?`)) return;
  const inventoryItem = state.inventory.find((item) => item.name.toLowerCase() === request.item.toLowerCase());
  if (inventoryItem && inventoryItem.quantity < request.quantity) { showToast(`Saldo insuficiente. Disponível: ${inventoryItem.quantity} unidade(s).`); return; }
  try {
    const updated = await apiPut(`/requests/${id}/deliver`);
    Object.assign(request, updated);
    if (inventoryItem) {
      inventoryItem.quantity -= request.quantity;
      const mov = await apiGet('/movements');
      state.movements = mov;
    }
    addActivity('Material entregue', `${request.item} entregue para ${request.requester}`);
    renderAll();
    showToast('Entrega registrada no histórico.');
  } catch (err) { showToast(err.message); }
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
  if (!record || !window.confirm(`Confirmar a devolução de ${record.item}?`)) return;
  try {
    const updated = await apiPut(`/custody/${id}/return`);
    Object.assign(record, updated);
    const item = state.inventory.find((entry) => entry.id === record.inventory_id);
    if (item) item.location = 'Armário de equipamentos';
    addActivity('Equipamento devolvido', `${record.item} devolvido por ${record.holder}`);
    renderAll(); showToast('Devolução registrada no histórico.');
  } catch (err) { showToast(err.message); }
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
$('#modalForm').addEventListener('submit', (event) => { event.preventDefault(); if (modalAction) modalAction(event.currentTarget); });
['inventorySearch', 'inventoryCategory', 'inventoryStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'inventorySearch' ? 'input' : 'change', renderInventory));
['movementSearch', 'movementType'].forEach((id) => $(`#${id}`).addEventListener(id === 'movementSearch' ? 'input' : 'change', renderMovements));
['custodySearch', 'custodyStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'custodySearch' ? 'input' : 'change', renderCustody));
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
  try {
    const result = await apiPost('/auth/login', { email: data.email, password: data.password });
    setToken(result.token);
    await startSession(result.user);
  } catch {
    $('#loginError').textContent = 'E-mail ou senha inválidos.';
  }
});

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
  loadState().then(renderAll);
} else {
  endSession();
}
