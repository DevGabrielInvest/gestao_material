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
};

document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icons[el.dataset.icon] || icons.box; });

const initialState = {
  inventory: [
    { id: 1, name: 'Papel A4', code: 'MAT-001', category: 'Papelaria', location: 'Armário A', quantity: 3, minimum: 5, value: 32.9, valuable: false },
    { id: 2, name: 'Caneta esferográfica azul', code: 'MAT-002', category: 'Papelaria', location: 'Gaveta 02', quantity: 24, minimum: 10, value: 2.5, valuable: false },
    { id: 3, name: 'Notebook Dell Latitude 5440', code: 'PAT-014', category: 'Informática', location: 'Em posse', quantity: 1, minimum: 1, value: 5890, valuable: true },
    { id: 4, name: 'Monitor LG 24 polegadas', code: 'PAT-021', category: 'Informática', location: 'Sala de reunião', quantity: 2, minimum: 1, value: 920, valuable: true },
    { id: 5, name: 'Toner HP 58A', code: 'MAT-018', category: 'Impressão', location: 'Armário B', quantity: 1, minimum: 2, value: 465, valuable: false },
    { id: 6, name: 'Headset Logitech H390', code: 'PAT-032', category: 'Periféricos', location: 'Em posse', quantity: 1, minimum: 1, value: 245, valuable: true },
    { id: 7, name: 'Bloco adesivo 76x76', code: 'MAT-027', category: 'Papelaria', location: 'Gaveta 03', quantity: 18, minimum: 6, value: 8.9, valuable: false },
    { id: 8, name: 'Webcam Logitech C920', code: 'PAT-038', category: 'Periféricos', location: 'Armário TI', quantity: 3, minimum: 1, value: 489, valuable: true },
  ],
  requests: [
    { id: 101, item: 'Cadeira ergonômica', requester: 'Marina Costa', department: 'Financeiro', quantity: 1, reason: 'Substituição de cadeira com encosto danificado.', priority: 'Alta', date: '2026-06-18', status: 'pending' },
    { id: 102, item: 'Papel A4', requester: 'Lucas Mendes', department: 'Jurídico', quantity: 5, reason: 'Reposição para impressões da equipe.', priority: 'Normal', date: '2026-06-17', status: 'approved' },
    { id: 103, item: 'Mouse sem fio', requester: 'Ana Ribeiro', department: 'Comercial', quantity: 1, reason: 'Novo posto de trabalho.', priority: 'Normal', date: '2026-06-16', status: 'delivered' },
    { id: 104, item: 'Toner HP 58A', requester: 'Carlos Lima', department: 'Administrativo', quantity: 2, reason: 'Estoque de segurança para a impressora central.', priority: 'Alta', date: '2026-06-19', status: 'pending' },
  ],
  custody: [
    { id: 201, inventoryId: 3, item: 'Notebook Dell Latitude 5440', code: 'PAT-014', holder: 'Renata Alves', department: 'Diretoria', checkout: '2026-06-03', expected: '2026-07-03', returned: '', value: 5890, notes: 'Equipamento, carregador e mochila entregues em perfeito estado.', status: 'active' },
    { id: 202, inventoryId: 6, item: 'Headset Logitech H390', code: 'PAT-032', holder: 'Bruno Tavares', department: 'Atendimento', checkout: '2026-06-10', expected: '2026-06-24', returned: '', value: 245, notes: 'Uso em trabalho remoto.', status: 'active' },
  ],
  activity: [
    { text: 'Nova solicitação criada', detail: 'Carlos pediu 2 unidades de Toner HP 58A', date: '2026-06-19T09:20:00' },
    { text: 'Material entregue', detail: 'Mouse sem fio entregue para Ana Ribeiro', date: '2026-06-18T16:15:00' },
    { text: 'Retirada registrada', detail: 'Headset entregue para Bruno Tavares', date: '2026-06-10T10:30:00' },
  ],
};

const storageKey = 'almox-office-state-v1';
let state = JSON.parse(localStorage.getItem(storageKey) || 'null') || initialState;
const sessionKey = 'dfa-office-session-v1';
const users = [
  { id: 1, name: 'Administração DFA', email: 'admin@dfa.com', password: 'admin123', role: 'admin', department: 'Administração' },
  { id: 2, name: 'Marina Gestora', email: 'gestor@dfa.com', password: 'gestor123', role: 'manager', department: 'Administrativo' },
  { id: 3, name: 'Lucas Colaborador', email: 'colaborador@dfa.com', password: 'solicitar123', role: 'requester', department: 'Jurídico' },
  { id: 4, name: 'Consulta Interna', email: 'consulta@dfa.com', password: 'consulta123', role: 'viewer', department: 'Diretoria' },
];
const roleLabels = { admin: 'Administrador', manager: 'Gestor', requester: 'Solicitante', viewer: 'Somente consulta' };
let currentUser = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
let activeRequestFilter = 'all';
let modalAction = null;

const $ = (selector) => document.querySelector(selector);
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '—';
const initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
const isOverdue = (record) => record.status === 'active' && new Date(`${record.expected}T23:59:59`) < new Date();

const permissionMap = {
  approve: ['admin', 'manager'],
  manageInventory: ['admin', 'manager'],
  manageCustody: ['admin', 'manager'],
  request: ['admin', 'manager', 'requester'],
  viewAllRequests: ['admin', 'manager', 'viewer'],
};
const can = (permission) => Boolean(currentUser && permissionMap[permission]?.includes(currentUser.role));
const canOpenPage = (page) => currentUser?.role !== 'requester' || page === 'requests';

function normalizeState() {
  state.requests.forEach((request) => {
    if (!request.history) {
      request.history = [{ action: 'created', label: 'Solicitação criada', user: request.requester, date: `${request.date}T12:00:00`, note: request.reason }];
      if (request.status !== 'pending') request.history.push({ action: request.status, label: statusActionLabel(request.status), user: request.decidedBy || 'Administração', date: `${request.date}T16:00:00`, note: request.decisionNote || 'Registro anterior à implantação do histórico.' });
    }
  });
  save();
}

function statusActionLabel(status) {
  return { approved: 'Solicitação aprovada', rejected: 'Solicitação recusada', delivered: 'Material entregue', pending: 'Aguardando análise' }[status] || status;
}

function applyPermissions() {
  const requesterOnly = currentUser?.role === 'requester';
  document.querySelectorAll('.nav-item').forEach((button) => { button.hidden = !canOpenPage(button.dataset.page); });
  document.querySelectorAll('.quick-request').forEach((button) => { button.hidden = !can('request'); });
  $('#newItemButton').hidden = !can('manageInventory');
  $('#newCustodyButton').hidden = !can('manageCustody');
  $('#currentUserName').textContent = currentUser?.name || '';
  $('#currentUserRole').textContent = roleLabels[currentUser?.role] || '';
  $('#userAvatar').textContent = initials(currentUser?.name || 'DFA');
  if (requesterOnly) navigate('requests');
}

function startSession(user) {
  currentUser = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
  sessionStorage.setItem(sessionKey, JSON.stringify(currentUser));
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('auth-hidden');
  $('#loginError').textContent = '';
  applyPermissions();
  renderAll();
}

function endSession() {
  sessionStorage.removeItem(sessionKey);
  currentUser = null;
  $('#appShell').classList.add('auth-hidden');
  $('#loginScreen').classList.remove('hidden');
  $('#loginForm').reset();
  $('#loginEmail').focus();
}

function showToast(message) {
  $('#toastMessage').textContent = message;
  $('#toast').classList.add('show');
  window.setTimeout(() => $('#toast').classList.remove('show'), 2600);
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

function renderDashboard() {
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventoryId));
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
  $('#notificationDot').style.display = low.length || pending.length ? 'block' : 'none';

  const alerts = [
    ...low.map((item) => ({ type: 'low', title: item.name, detail: `Restam ${item.quantity} un. · Mínimo recomendado: ${item.minimum}`, badge: 'Estoque baixo' })),
    ...activeCustody.filter(isOverdue).map((item) => ({ type: 'overdue', title: item.item, detail: `${item.holder} · Previsto para ${dateLabel(item.expected)}`, badge: 'Atrasado' })),
  ].slice(0, 4);
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
  const custodyIds = new Set(state.custody.filter((item) => item.status === 'active').map((item) => item.inventoryId));
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
  const visible = can('viewAllRequests') ? state.requests : state.requests.filter((item) => item.requesterEmail === currentUser?.email || (!item.requesterEmail && item.requester === currentUser?.name));
  const pending = visible.filter((item) => item.status === 'pending').length;
  $('#allRequestCount').textContent = visible.length;
  $('#pendingRequestCount').textContent = pending;
  $('#requestNavCount').textContent = pending;
  $('#requestPermissionNote').textContent = can('approve') ? 'Você pode analisar pedidos. Toda aprovação ou recusa exige justificativa e fica registrada no histórico.' : currentUser?.role === 'requester' ? 'Você está visualizando apenas as solicitações criadas pela sua conta.' : 'Perfil de consulta: pedidos e históricos estão disponíveis somente para leitura.';
  const filtered = activeRequestFilter === 'all' ? visible : visible.filter((item) => item.status === activeRequestFilter);
  $('#requestsGrid').innerHTML = filtered.map((item) => {
    const decision = item.decisionNote ? `<div class="approval-record"><span>${escapeHtml(item.decidedBy || 'Administração')} · ${dateLabel((item.decidedAt || '').slice(0, 10))}</span><p>${escapeHtml(item.decisionNote)}</p></div>` : '';
    let actions = `<span class="asset-value">Solicitado em ${dateLabel(item.date)}</span>`;
    if (can('approve') && item.status === 'pending') actions = `<button class="button small primary request-approve" data-id="${item.id}">Aprovar</button><button class="button small danger request-reject" data-id="${item.id}">Recusar</button>`;
    if (can('approve') && item.status === 'approved') actions = `<button class="button small primary request-deliver" data-id="${item.id}">Marcar como entregue</button>`;
    return `<article class="request-card"><div class="request-card-top"><span class="code">SOL-${String(item.id).padStart(4, '0')}</span>${statusBadge(item.status)}</div><h3>${escapeHtml(item.item)}</h3><p>${escapeHtml(item.reason)}</p><div class="request-meta"><div><span>Solicitante</span><strong>${escapeHtml(item.requester)}</strong></div><div><span>Quantidade</span><strong>${item.quantity} unidade(s)</strong></div><div><span>Setor</span><strong>${escapeHtml(item.department)}</strong></div><div><span>Prioridade</span><strong>${escapeHtml(item.priority)}</strong></div></div>${decision}<div class="request-actions">${actions}<button class="history-button request-history" data-id="${item.id}">Histórico (${item.history?.length || 0})</button></div></article>`;
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
  $('#custodyCards').innerHTML = filtered.map((item) => `<article class="custody-card"><div class="custody-card-top"><div class="asset-icon">${icons.laptop}</div><div><h3>${escapeHtml(item.item)}</h3><span class="asset-code">${escapeHtml(item.code)} · ${escapeHtml(item.department)}</span></div>${statusBadge(item.status === 'active' && isOverdue(item) ? 'overdue' : item.status, 'custody')}</div><div class="custody-details"><div class="detail-block"><span>Responsável</span><strong>${escapeHtml(item.holder)}</strong></div><div class="detail-block"><span>Retirada</span><strong>${dateLabel(item.checkout)}</strong></div><div class="detail-block"><span>${item.status === 'returned' ? 'Devolvido em' : 'Devolver até'}</span><strong>${dateLabel(item.returned || item.expected)}</strong></div></div>${item.notes ? `<p class="custody-note">${escapeHtml(item.notes)}</p>` : ''}<div class="custody-card-footer"><span class="asset-value">Valor registrado: <strong>${money(item.value)}</strong></span>${item.status === 'active' && can('manageCustody') ? `<button class="button small secondary return-item" data-id="${item.id}">Registrar devolução</button>` : ''}</div></article>`).join('');
  $('#custodyEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.return-item').forEach((button) => button.addEventListener('click', () => returnCustody(Number(button.dataset.id))));
}

function renderAll() { renderDashboard(); renderInventory(); renderRequests(); renderCustody(); }

function navigate(page) {
  if (!canOpenPage(page)) { showToast('Seu perfil não possui acesso a esta área.'); return; }
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.page === page));
  $(`#${page}Page`).classList.add('active');
  const names = { dashboard: 'Visão geral', inventory: 'Materiais e equipamentos', requests: 'Solicitações', custody: 'Termos de posse' };
  $('#breadcrumbTitle').textContent = names[page];
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function openRequestModal() {
  if (!can('request')) { showToast('Seu perfil não pode criar solicitações.'); return; }
  const options = state.inventory.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('');
  openModal({ eyebrow: 'NOVO PEDIDO', title: 'Solicitar material ou equipamento', submitLabel: 'Enviar solicitação', body: `<div class="form-grid"><div class="field full"><label for="requestItem">Item solicitado *</label><input id="requestItem" name="item" list="inventoryOptions" required placeholder="Digite ou selecione um item"/><datalist id="inventoryOptions">${options}</datalist></div><div class="field"><label for="requester">Solicitante *</label><input id="requester" name="requester" required readonly value="${escapeHtml(currentUser.name)}"/></div><div class="field"><label for="requestDepartment">Setor *</label><input id="requestDepartment" name="department" required readonly value="${escapeHtml(currentUser.department)}"/></div><div class="field"><label for="requestQuantity">Quantidade *</label><input id="requestQuantity" name="quantity" type="number" min="1" value="1" required/></div><div class="field"><label for="requestPriority">Prioridade</label><select id="requestPriority" name="priority"><option>Normal</option><option>Alta</option><option>Urgente</option></select></div><div class="field full"><label for="requestReason">Motivo da solicitação *</label><textarea id="requestReason" name="reason" required placeholder="Explique brevemente a necessidade."></textarea></div></div>`, action: (form) => {
    const data = Object.fromEntries(new FormData(form));
    const now = new Date().toISOString();
    state.requests.unshift({ id: Date.now(), ...data, requesterEmail: currentUser.email, quantity: Number(data.quantity), date: now.slice(0, 10), status: 'pending', history: [{ action: 'created', label: 'Solicitação criada', user: currentUser.name, role: roleLabels[currentUser.role], date: now, note: data.reason }] });
    addActivity('Nova solicitação criada', `${data.requester} pediu ${data.quantity} unidade(s) de ${data.item}`);
    save(); closeModal(); renderAll(); navigate('requests'); showToast('Solicitação enviada para análise.');
  } });
}

function openItemModal(id = null) {
  if (!can('manageInventory')) { showToast('Seu perfil não pode alterar o inventário.'); return; }
  const item = state.inventory.find((entry) => entry.id === id) || {};
  openModal({ eyebrow: id ? 'ATUALIZAR CADASTRO' : 'NOVO CADASTRO', title: id ? 'Editar item' : 'Cadastrar material ou equipamento', submitLabel: id ? 'Salvar alterações' : 'Cadastrar item', body: `<div class="form-grid"><div class="field full"><label for="itemName">Nome do item *</label><input id="itemName" name="name" required value="${escapeHtml(item.name || '')}" placeholder="Ex.: Monitor Dell 24 polegadas"/></div><div class="field"><label for="itemCode">Código *</label><input id="itemCode" name="code" required value="${escapeHtml(item.code || '')}" placeholder="MAT-001 ou PAT-001"/></div><div class="field"><label for="itemCategory">Categoria *</label><input id="itemCategory" name="category" required value="${escapeHtml(item.category || '')}" placeholder="Ex.: Informática"/></div><div class="field"><label for="itemLocation">Localização *</label><input id="itemLocation" name="location" required value="${escapeHtml(item.location || '')}" placeholder="Ex.: Armário A"/></div><div class="field"><label for="itemValue">Valor unitário (R$)</label><input id="itemValue" name="value" type="number" min="0" step="0.01" value="${item.value || 0}"/></div><div class="field"><label for="itemQuantity">Quantidade atual *</label><input id="itemQuantity" name="quantity" type="number" min="0" required value="${item.quantity ?? 1}"/></div><div class="field"><label for="itemMinimum">Estoque mínimo *</label><input id="itemMinimum" name="minimum" type="number" min="0" required value="${item.minimum ?? 1}"/></div><div class="field full"><label><input name="valuable" type="checkbox" ${item.valuable ? 'checked' : ''}/> Item de valor que exige termo de posse</label><small>Use para notebooks, celulares, monitores e outros bens patrimoniais.</small></div></div>`, action: (form) => {
    const data = Object.fromEntries(new FormData(form));
    const updated = { ...item, ...data, id: id || Date.now(), quantity: Number(data.quantity), minimum: Number(data.minimum), value: Number(data.value), valuable: Boolean(data.valuable) };
    if (id) state.inventory = state.inventory.map((entry) => entry.id === id ? updated : entry); else state.inventory.unshift(updated);
    addActivity(id ? 'Cadastro atualizado' : 'Novo item cadastrado', `${updated.name} · ${updated.quantity} unidade(s)`);
    save(); closeModal(); renderAll(); showToast(id ? 'Item atualizado.' : 'Item cadastrado no inventário.');
  } });
}

function openCustodyModal() {
  if (!can('manageCustody')) { showToast('Seu perfil não pode registrar retiradas.'); return; }
  const available = state.inventory.filter((item) => item.valuable && !state.custody.some((record) => record.inventoryId === item.id && record.status === 'active'));
  const options = available.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(item.code)}</option>`).join('');
  openModal({ eyebrow: 'RESPONSABILIDADE', title: 'Registrar retirada de equipamento', submitLabel: 'Registrar retirada', body: `<div class="form-grid"><div class="field full"><label for="custodyItem">Equipamento *</label><select id="custodyItem" name="inventoryId" required><option value="">Selecione o bem</option>${options}</select>${available.length ? '' : '<small>Não há itens de valor disponíveis. Cadastre ou devolva um equipamento.</small>'}</div><div class="field"><label for="holder">Responsável *</label><input id="holder" name="holder" required placeholder="Nome completo"/></div><div class="field"><label for="holderDepartment">Setor *</label><input id="holderDepartment" name="department" required placeholder="Ex.: Diretoria"/></div><div class="field"><label for="checkout">Data da retirada *</label><input id="checkout" name="checkout" type="date" value="${new Date().toISOString().slice(0, 10)}" required/></div><div class="field"><label for="expected">Previsão de devolução *</label><input id="expected" name="expected" type="date" required/></div><div class="field full"><label for="custodyNotes">Estado e observações</label><textarea id="custodyNotes" name="notes" placeholder="Acessórios entregues, estado de conservação e finalidade."></textarea></div></div>`, action: (form) => {
    const data = Object.fromEntries(new FormData(form));
    const item = state.inventory.find((entry) => entry.id === Number(data.inventoryId));
    if (!item) { showToast('Selecione um equipamento disponível.'); return; }
    state.custody.unshift({ id: Date.now(), inventoryId: item.id, item: item.name, code: item.code, holder: data.holder, department: data.department, checkout: data.checkout, expected: data.expected, returned: '', value: item.value, notes: data.notes, status: 'active' });
    item.location = 'Em posse';
    addActivity('Retirada registrada', `${item.name} entregue para ${data.holder}`);
    save(); closeModal(); renderAll(); showToast('Termo de posse registrado.');
  } });
}

function registerRequestAction(request, status, note) {
  const now = new Date().toISOString();
  request.status = status;
  request.history ||= [];
  request.history.push({ action: status, label: statusActionLabel(status), user: currentUser.name, role: roleLabels[currentUser.role], date: now, note });
  if (status === 'approved' || status === 'rejected') {
    request.decidedBy = currentUser.name;
    request.decidedAt = now;
    request.decisionNote = note;
  }
  addActivity(statusActionLabel(status), `${request.item} · ${request.requester}`);
  save();
  renderAll();
}

function openDecisionModal(id, status) {
  if (!can('approve')) { showToast('Seu perfil não pode analisar solicitações.'); return; }
  const request = state.requests.find((item) => item.id === id);
  if (!request || request.status !== 'pending') return;
  const approving = status === 'approved';
  openModal({ eyebrow: 'DECISÃO AUDITÁVEL', title: approving ? 'Aprovar solicitação' : 'Recusar solicitação', submitLabel: approving ? 'Confirmar aprovação' : 'Confirmar recusa', body: `<div class="permission-note"><strong>${escapeHtml(request.item)}</strong><br>${request.quantity} unidade(s) · ${escapeHtml(request.requester)}</div><div class="field"><label for="decisionNote">Justificativa da decisão *</label><textarea id="decisionNote" name="note" required minlength="5" placeholder="Registre o motivo para manter a decisão documentada."></textarea><small>A decisão será vinculada a ${escapeHtml(currentUser.name)}.</small></div>`, action: (form) => {
    const note = new FormData(form).get('note').trim();
    if (note.length < 5) return;
    registerRequestAction(request, status, note);
    closeModal();
    showToast(approving ? 'Solicitação aprovada e documentada.' : 'Solicitação recusada e documentada.');
  } });
}

function deliverRequest(id) {
  if (!can('approve')) { showToast('Seu perfil não pode registrar entregas.'); return; }
  const request = state.requests.find((item) => item.id === id);
  if (!request || request.status !== 'approved' || !window.confirm(`Confirmar a entrega de ${request.item} para ${request.requester}?`)) return;
  registerRequestAction(request, 'delivered', `Entrega confirmada por ${currentUser.name}.`);
  showToast('Entrega registrada no histórico.');
}

function openRequestHistory(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return;
  const entries = [...(request.history || [])].reverse().map((entry) => {
    const date = new Date(entry.date);
    return `<div class="audit-entry"><strong>${escapeHtml(entry.label)}</strong><span>${escapeHtml(entry.user)}${entry.role ? ` · ${escapeHtml(entry.role)}` : ''} · ${date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}</div>`;
  }).join('');
  openModal({ eyebrow: `SOL-${String(request.id).padStart(4, '0')}`, title: `Histórico · ${request.item}`, submitLabel: '', hideSubmit: true, body: `<div class="audit-list">${entries || '<p>Nenhum evento registrado.</p>'}</div>`, action: null });
}

function returnCustody(id) {
  if (!can('manageCustody')) { showToast('Seu perfil não pode registrar devoluções.'); return; }
  const record = state.custody.find((item) => item.id === id);
  if (!record || !window.confirm(`Confirmar a devolução de ${record.item}?`)) return;
  record.status = 'returned';
  record.returned = new Date().toISOString().slice(0, 10);
  const item = state.inventory.find((entry) => entry.id === record.inventoryId);
  if (item) item.location = 'Armário de equipamentos';
  addActivity('Equipamento devolvido', `${record.item} devolvido por ${record.holder}`);
  save(); renderAll(); showToast('Devolução registrada no histórico.');
}

document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.go)));
document.querySelectorAll('.quick-request').forEach((button) => button.addEventListener('click', openRequestModal));
$('#newItemButton').addEventListener('click', () => openItemModal());
$('#newCustodyButton').addEventListener('click', openCustodyModal);
$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#closeModal').addEventListener('click', closeModal);
$('#cancelModal').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', (event) => { if (event.target === $('#modalBackdrop')) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
$('#modalForm').addEventListener('submit', (event) => { event.preventDefault(); if (modalAction) modalAction(event.currentTarget); });
['inventorySearch', 'inventoryCategory', 'inventoryStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'inventorySearch' ? 'input' : 'change', renderInventory));
['custodySearch', 'custodyStatus'].forEach((id) => $(`#${id}`).addEventListener(id === 'custodySearch' ? 'input' : 'change', renderCustody));
$('#requestTabs').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  activeRequestFilter = button.dataset.filter;
  document.querySelectorAll('#requestTabs button').forEach((item) => item.classList.toggle('active', item === button));
  renderRequests();
});

$('#loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const user = users.find((entry) => entry.email.toLowerCase() === data.email.trim().toLowerCase() && entry.password === data.password);
  if (!user) {
    $('#loginError').textContent = 'E-mail ou senha inválidos.';
    return;
  }
  startSession(user);
});

document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', () => {
  const user = users.find((entry) => entry.role === button.dataset.demo);
  if (!user) return;
  $('#loginEmail').value = user.email;
  $('#loginPassword').value = user.password;
  $('#loginError').textContent = '';
  $('#loginPassword').focus();
}));

$('#logoutButton').addEventListener('click', endSession);

$('#todayLabel').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
normalizeState();
const validSession = currentUser && users.some((user) => user.email === currentUser.email && user.role === currentUser.role);
if (validSession) startSession(currentUser); else endSession();
