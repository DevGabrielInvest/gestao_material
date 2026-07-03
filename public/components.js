let currentUser = null;
let activeRequestFilter = 'all';
let modalAction = null;

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
