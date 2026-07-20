function renderDashboard() {
  const activeCustody = state.custody.filter((item) => item.status === 'active');
  const custodyIds = new Set(activeCustody.map((item) => item.inventory_id));
  const low = state.inventory.filter((item) => item.quantity <= item.minimum && !custodyIds.has(item.id));
  const pending = state.requests.filter((item) => item.status === 'pending');
  const totalValue = activeCustody.reduce((sum, item) => sum + Number(item.value), 0);
  const dash = state.dashboard || {};
  const custodyStats = state.stats.custody || {};
  $('#statItems').textContent = dash.inventoryCount ?? state.inventory.length;
  $('#statCategories').textContent = `${dash.categories ?? new Set(state.inventory.map((item) => item.category)).size} categorias`;
  $('#statLowStock').textContent = dash.lowStock ?? low.length;
  $('#statCustody').textContent = dash.activeCustody ?? custodyStats.activeCount ?? activeCustody.length;
  $('#statCustodyValue').textContent = `${money(dash.custodyValue ?? custodyStats.activeValue ?? totalValue)} sob responsabilidade`;
  $('#statRequests').textContent = dash.pendingRequests ?? pending.length;
  $('#requestNavCount').textContent = dash.pendingRequests ?? pending.length;
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
  const categories = state.categories.length ? state.categories : [...new Set(state.inventory.map((item) => item.category))].sort();
  const current = $('#inventoryCategory').value;
  $('#inventoryCategory').innerHTML = '<option value="all">Todas as categorias</option>' + categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  $('#inventoryCategory').value = categories.includes(current) ? current : 'all';
  const custodyIds = new Set(state.custody.filter((item) => item.status === 'active').map((item) => item.inventory_id));
  const filtered = state.inventory;

  const summary = state.summaries.inventory;
  const totalTypes = summary?.count ?? state.pagination.inventory?.total ?? state.inventory.length;
  const totalUnits = summary?.units ?? state.inventory.reduce((sum, item) => sum + Number(item.quantity), 0);
  const value = summary?.value ?? state.inventory.reduce((sum, item) => sum + Number(item.quantity) * Number(item.value), 0);
  $('#inventorySummary').innerHTML = `<div class="summary-card"><span>Tipos de item</span><strong>${totalTypes}</strong></div><div class="summary-card"><span>Unidades totais</span><strong>${totalUnits}</strong></div><div class="summary-card"><span>Valor estimado</span><strong>${money(value)}</strong></div>`;
  $('#inventoryBody').innerHTML = filtered.map((item) => {
    const inCustody = item.in_custody ?? custodyIds.has(item.id);
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
  const pendingTotal = (can('viewAllRequests') && state.dashboard) ? state.dashboard.pendingRequests : pending;
  $('#allRequestCount').textContent = state.pagination.requests?.total ?? visible.length;
  $('#pendingRequestCount').textContent = pendingTotal;
  $('#requestNavCount').textContent = pendingTotal;
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

function acceptanceStatusBadge(status) {
  const labels = { pending: ['Aguardando', 'amber'], token_sent: ['Token enviado', 'blue'], completed: ['Aceito', 'green'] };
  const [label, color] = labels[status] || [status, 'gray'];
  return `<span class="status ${color}">${label}</span>`;
}

async function sendAcceptanceToken(id) {
  if (!can('manageCustody')) { showToast('Seu perfil não pode enviar tokens.'); return; }
  const record = state.custody.find((item) => item.id === id);
  if (!record) return;
  if (!record.holder_email) { showToast('Este termo não possui e-mail do responsável.'); return; }

  showConfirm({
    title: 'Enviar token de aceitação',
    message: `Um e-mail com o token será enviado para ${record.holder_email} (${record.holder}). O responsável precisará clicar no link e confirmar a aceitação do termo.`,
    confirmLabel: 'Enviar token',
    onConfirm: async () => {
      try {
        const result = await apiPost(`/acceptance/${id}/send-token`, {});
        showToast(result.message);
        const updated = await apiGet(`/custody?limit=1&offset=0&search=${encodeURIComponent(record.code)}`);
        if (updated.data?.length) {
          const idx = state.custody.findIndex((item) => item.id === id);
          if (idx !== -1) state.custody[idx] = { ...state.custody[idx], acceptance_status: 'token_sent' };
          renderCustody();
        }
      } catch (err) { showToast(err.message); }
    }
  });
}

async function verifyAcceptanceToken(id, token) {
  try {
    const result = await fetch(`/api/acceptance/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!result.ok) {
      const data = await result.json().catch(() => ({}));
      throw new Error(data.error || 'Token inválido ou expirado.');
    }
    const blob = await result.blob();
    const hash = result.headers.get('X-PDF-Hash') || '';
    const match = /filename="?([^";]+)"?/.exec(result.headers.get('Content-Disposition') || '');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = match ? match[1] : `termo-aceito-${id}.pdf`;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    return { hash };
  } catch (err) {
    throw err;
  }
}

function renderAcceptancePage(id, token) {
  const container = $('#acceptancePage');
  container.classList.add('active');

  $('#acceptancePage .page-heading h1').textContent = 'Aceitar Termo de Responsabilidade';
  $('#acceptancePage .page-heading p').textContent = 'Confirme sua responsabilidade sobre o equipamento recebido.';

  const body = $('#acceptanceBody');
  body.innerHTML = `
    <div class="acceptance-loading" id="acceptanceLoading">
      <span data-icon="spinner"></span>
      <p>Carregando termo...</p>
    </div>
    <div class="acceptance-content" id="acceptanceContent" style="display:none;">
      <div class="acceptance-preview panel" id="acceptancePreview">
        <div class="panel-header"><div><p class="eyebrow">TERMO DE POSSE</p><h2>Detalhes do equipamento</h2></div></div>
        <div class="acceptance-details" id="acceptanceDetails"></div>
      </div>
      <div class="acceptance-form panel" id="acceptanceFormPanel">
        <div class="panel-header"><div><p class="eyebrow">CONFIRMAÇÃO</p><h2>Aceitar termo</h2></div></div>
        <p>Ao confirmar, seu IP, navegador e sistema operacional serão registrados para garantir a rastreabilidade da sua aceitação.</p>
        <div class="field">
          <label for="acceptanceTokenInput">Token de confirmação</label>
          <input id="acceptanceTokenInput" type="text" value="${escapeHtml(token || '')}" placeholder="Cole o token recebido por e-mail" />
        </div>
        <button class="button primary" id="acceptanceConfirmBtn" style="width:100%;margin-top:1rem;">
          <span data-icon="check"></span> Eu Aceito - Confirmar Responsabilidade
        </button>
        <div id="acceptanceResult" class="acceptance-result" style="display:none;"></div>
      </div>
    </div>
    <div class="acceptance-success" id="acceptanceSuccess" style="display:none;">
      <div class="success-icon"><span data-icon="check"></span></div>
      <h2>Termo aceito com sucesso!</h2>
      <p>O PDF do termo foi gerado com sua confirmação. O download iniciou automaticamente.</p>
      <p class="hash-info" id="hashInfo"></p>
      <p style="margin-top:1rem;">Guarde o PDF e o hash para futuras verificações de integridade.</p>
      <a href="/" class="button secondary" style="margin-top:1.5rem;">Voltar ao início</a>
    </div>
  `;

  const acceptanceContent = $('#acceptanceContent');
  const acceptanceSuccess = $('#acceptanceSuccess');
  const loading = $('#acceptanceLoading');

  if (!token) {
    loading.innerHTML = '<p style="color:var(--coral)">O link de aceitação está incompleto. Solicite um novo token à administração.</p>';
  }

  const previewRequest = token ? fetch(`/api/acceptance/${id}/preview`, {
    method: 'POST',
    headers: { 'Accept': 'application/pdf', 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }) : null;

  previewRequest?.then(async (res) => {
    if (!res.ok) { loading.innerHTML = '<p style="color:var(--coral)">Erro ao carregar o termo.</p>'; return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    loading.style.display = 'none';
    acceptanceContent.style.display = '';
    $('#acceptancePreview').innerHTML += `
      <iframe src="${url}" class="acceptance-pdf-iframe" title="Pré-visualização do termo"></iframe>
      <a class="button secondary acceptance-open-pdf" href="${url}" target="_blank" rel="noopener">Abrir PDF em outra aba</a>
    `;
    $('#acceptanceDetails').innerHTML = '<p>Termo carregado. Revise o documento antes de confirmar.</p>';
    window.addEventListener('pagehide', () => URL.revokeObjectURL(url), { once: true });
  }).catch(() => {
    loading.innerHTML = '<p style="color:var(--coral)">Erro ao carregar o termo.</p>';
  });

  const confirmBtn = $('#acceptanceConfirmBtn');
  const tokenInput = $('#acceptanceTokenInput');
  const resultDiv = $('#acceptanceResult');

  confirmBtn.addEventListener('click', async () => {
    const tokenValue = tokenInput.value.trim();
    if (!tokenValue) { showToast('Digite ou cole o token recebido por e-mail.'); return; }
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = icons.spinner + ' Validando...';
    try {
      const { hash } = await verifyAcceptanceToken(id, tokenValue);
      acceptanceContent.style.display = 'none';
      acceptanceSuccess.style.display = '';
      if (hash) {
        $('#hashInfo').innerHTML = `
          <strong>Hash SHA-256 do PDF:</strong><br>
          <code style="font-size:11px;word-break:break-all;">${hash}</code><br>
          <small>Guarde este hash para verificar a autenticidade do documento.</small>
        `;
      }
      if (typeof loadState === 'function') loadState();
    } catch (err) {
      resultDiv.style.display = '';
      resultDiv.innerHTML = `<p style="color:var(--coral)">${escapeHtml(err.message)}</p>`;
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span data-icon="check"></span> Eu Aceito - Confirmar Responsabilidade';
    }
  });
}

function renderCustody() {
  const filtered = state.custody;
  const activeValue = state.stats.custody?.activeValue ?? state.custody.filter((item) => item.status === 'active').reduce((sum, item) => sum + Number(item.value), 0);
  $('#custodyTotalValue').textContent = money(activeValue);
  $('#custodyCards').innerHTML = filtered.map((item) => {
    const isActive = item.status === 'active';
    const overdue = isActive && isOverdue(item);
    const acceptanceBadge = item.holder_email ? acceptanceStatusBadge(item.acceptance_status || 'pending') : '';
    const acceptanceActions = isActive && can('manageCustody') && item.holder_email
      ? (item.acceptance_status === 'pending'
        ? `<button class="button small secondary send-token" data-id="${item.id}">${icons.mail} Enviar token</button>`
        : item.acceptance_status === 'token_sent'
        ? `<button class="button small secondary send-token" data-id="${item.id}">${icons.mail} Reenviar token</button>`
        : '')
      : '';
    return `<article class="custody-card"><div class="custody-card-top"><div class="asset-icon">${icons.laptop}</div><div><h3>${escapeHtml(item.item)}</h3><span class="asset-code">${escapeHtml(item.code)} · ${escapeHtml(item.department)}</span></div><div class="badge-group">${statusBadge(overdue ? 'overdue' : item.status, 'custody')}${acceptanceBadge}</div></div><div class="custody-details"><div class="detail-block"><span>Responsável</span><strong>${escapeHtml(item.holder)}</strong></div><div class="detail-block"><span>${item.holder_email ? 'E-mail' : 'Retirada'}</span><strong>${item.holder_email ? escapeHtml(item.holder_email) : dateLabel(item.checkout)}</strong></div><div class="detail-block"><span>${item.status === 'returned' ? 'Devolvido em' : 'Devolver até'}</span><strong>${dateLabel(item.returned || item.expected)}</strong></div></div>${item.notes ? `<p class="custody-note">${escapeHtml(item.notes)}</p>` : ''}<div class="custody-card-footer"><span class="asset-value">Valor registrado: <strong>${money(item.value)}</strong></span><div class="custody-actions"><button class="button small secondary custody-pdf" data-id="${item.id}">${icons.download} Gerar termo PDF</button>${acceptanceActions}${isActive && can('manageCustody') ? `<button class="button small secondary return-item" data-id="${item.id}">Registrar devolução</button>` : ''}</div></div></article>`;
  }).join('');
  const pagInfo = state.pagination.custody;
  if (pagInfo && pagInfo.hasMore && filtered.length > 0) {
    $('#custodyCards').innerHTML += `<div style="text-align: center; padding: 2rem; grid-column: 1/-1;"><button class="button secondary" id="loadMoreCustody">Carregar mais equipamentos (${pagInfo.total - state.custody.length} restantes)</button></div>`;
    setTimeout(() => $('#loadMoreCustody')?.addEventListener('click', () => loadMore('custody')), 0);
  }
  $('#custodyEmpty').classList.toggle('show', !filtered.length);
  document.querySelectorAll('.return-item').forEach((button) => button.addEventListener('click', () => returnCustody(Number(button.dataset.id))));
  document.querySelectorAll('.custody-pdf').forEach((button) => button.addEventListener('click', () => generateCustodyPdf(Number(button.dataset.id))));
  document.querySelectorAll('.send-token').forEach((button) => button.addEventListener('click', () => sendAcceptanceToken(Number(button.dataset.id))));
}

function renderMovements() {
  const dateFrom = $('#movementDateFrom').value;
  const dateTo = $('#movementDateTo').value;
  const filtered = state.movements;

  const stats = state.stats.movements;
  const entries = stats?.entries ?? filtered.filter((m) => m.type === 'entry').reduce((s, m) => s + Number(m.quantity), 0);
  const exits = stats?.exits ?? filtered.filter((m) => m.type === 'exit').reduce((s, m) => s + Number(m.quantity), 0);
  const suppliers = stats?.suppliers ?? new Set(filtered.filter((m) => m.type === 'entry' && m.supplier).map((m) => m.supplier)).size;
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

let reportSeq = 0;

async function renderReports() {
  if (!can('viewReports')) return;
  if (!$('#reportsPage').classList.contains('active')) return;
  const dateFrom = $('#reportDateFrom')?.value || '';
  const dateTo = $('#reportDateTo')?.value || '';
  const seq = ++reportSeq;
  let report;
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const query = params.toString();
    report = await apiGet(`/reports/summary${query ? `?${query}` : ''}`);
  } catch (err) {
    console.error('Erro ao carregar relatórios:', err);
    showToast(err.message || 'Não foi possível carregar os relatórios.');
    return;
  }
  if (seq !== reportSeq) return;

  const totals = report.totals;
  const periodNote = dateFrom || dateTo ? ` · ${dateFrom ? dateLabel(dateFrom) : '...'} a ${dateTo ? dateLabel(dateTo) : '...'}` : '';
  $('#reportKpis').innerHTML = `<article><span>Valor em inventário</span><strong>${money(totals.inventoryValue)}</strong></article><article><span>Patrimônio em posse</span><strong>${money(totals.custodyValue)}</strong></article><article><span>Unidades consumidas${escapeHtml(periodNote)}</span><strong>${totals.consumed}</strong></article><article><span>Itens para reposição</span><strong>${totals.lowStock}</strong></article>`;

  const consumption = report.consumption;
  const maxConsumption = Math.max(...consumption.map((item) => item.quantity), 1);
  $('#consumptionReport').innerHTML = consumption.length ? consumption.map((item) => `<div class="report-row"><div><strong>${escapeHtml(item.item)}</strong><span>${item.quantity} unidade(s)</span></div><i><b style="width:${(item.quantity / maxConsumption) * 100}%"></b></i></div>`).join('') : `<div class="empty-state show"><p>Nenhuma saída${periodNote ? ' no período selecionado' : ' registrada'}.</p></div>`;

  const holders = report.holders;
  const maxHolderValue = Math.max(...holders.map((item) => item.value), 1);
  $('#holderReport').innerHTML = holders.length ? holders.map((data) => `<div class="report-row"><div><strong>${escapeHtml(data.holder)}</strong><span>${data.quantity} bem(ns) · ${money(data.value)}</span></div><i><b style="width:${(data.value / maxHolderValue) * 100}%"></b></i></div>`).join('') : '<div class="empty-state show"><p>Nenhum patrimônio em posse.</p></div>';

  $('#reportInventoryBody').innerHTML = report.inventory.map((item) => {
    const situation = item.in_custody ? '<span class="status blue">Em posse</span>' : item.quantity <= item.minimum ? '<span class="status amber">Repor</span>' : '<span class="status green">Regular</span>';
    return `<tr><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)}</small></td><td>${escapeHtml(item.category)}</td><td>${item.quantity} un.</td><td>${item.minimum} un.</td><td>${money(item.quantity * item.value)}</td><td>${situation}</td></tr>`;
  }).join('');
}

function renderAll() { renderDashboard(); renderInventory(); renderMovements(); renderRequests(); renderCustody(); renderReports(); }

async function openMovementModal() {
  if (!can('manageInventory')) { showToast('Seu perfil não pode registrar movimentações.'); return; }
  const options = state.inventory.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · Saldo: ${item.quantity}</option>`).join('');
  openModal({ eyebrow: 'CONTROLE DE ESTOQUE', title: 'Registrar movimentação', submitLabel: 'Confirmar movimentação', body: `<div class="form-grid"><div class="field full"><label for="movementItem">Item *</label><select id="movementItem" name="inventoryId" required><option value="">Selecione o item</option>${options}</select></div><div class="field"><label for="movementKind">Tipo *</label><select id="movementKind" name="type" required><option value="entry">Entrada</option><option value="exit">Saída</option></select></div><div class="field"><label for="movementQuantity">Quantidade *</label><input id="movementQuantity" name="quantity" type="number" min="1" value="1" required /></div><div class="field"><label for="movementDate">Data *</label><input id="movementDate" name="date" type="date" value="${todayLocal()}" required /></div><div class="field"><label for="movementSupplier">Fornecedor ou destino *</label><input id="movementSupplier" name="supplier" required placeholder="Empresa, setor ou pessoa" /></div><div class="field"><label for="movementDocument">Nota fiscal / documento</label><input id="movementDocument" name="document" placeholder="Ex.: NF-2031 ou REQ-0102" /></div><div class="field"><label for="movementResponsible">Responsável</label><input id="movementResponsible" name="responsible" readonly value="${escapeHtml(currentUser.name)}" /></div><div class="field full"><label for="movementNotes">Observações</label><textarea id="movementNotes" name="notes" placeholder="Motivo, condição recebida ou informações adicionais."></textarea></div></div>`, action: async (form) => {
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

async function openRequestModal() {
  if (!can('request')) { showToast('Seu perfil não pode criar solicitações.'); return; }
  const options = state.inventory.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('');
  openModal({ eyebrow: 'NOVO PEDIDO', title: 'Solicitar material ou equipamento', submitLabel: 'Enviar solicitação', body: `<div class="form-grid"><div class="field full"><label for="requestItem">Item solicitado *</label><input id="requestItem" name="item" list="inventoryOptions" required placeholder="Digite ou selecione um item"/><datalist id="inventoryOptions">${options}</datalist></div><div class="field"><label for="requester">Solicitante *</label><input id="requester" readonly value="${escapeHtml(currentUser.name)}"/></div><div class="field"><label for="requestDepartment">Setor *</label><input id="requestDepartment" readonly value="${escapeHtml(currentUser.department)}"/></div><div class="field"><label for="requestQuantity">Quantidade *</label><input id="requestQuantity" name="quantity" type="number" min="1" value="1" required/></div><div class="field"><label for="requestPriority">Prioridade</label><select id="requestPriority" name="priority"><option>Normal</option><option>Alta</option><option>Urgente</option></select></div><div class="field full"><label for="requestReason">Motivo da solicitação *</label><textarea id="requestReason" name="reason" required placeholder="Explique brevemente a necessidade."></textarea></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    try {
      const created = await apiPost('/requests', { ...data, quantity: Number(data.quantity), priority: data.priority || 'Normal' });
      state.requests.unshift(created);
      addActivity('Nova solicitação criada', `${currentUser.name} pediu ${data.quantity} unidade(s) de ${data.item}`);
      closeModal(); renderAll(); navigate('requests'); showToast('Solicitação enviada para análise.');
    } catch (err) { showToast(err.message); }
  } });
}

function openItemModal(id = null) {
  if (!can('manageInventory')) { showToast('Seu perfil não pode alterar o inventário.'); return; }
  const item = state.inventory.find((entry) => entry.id === id) || {};
  const extraFields = `
    <div class="field"><label for="itemSerialNumber">Número de série</label><input id="itemSerialNumber" name="serialNumber" value="${escapeHtml(item.serial_number || '')}" placeholder="SN-12345"/></div>
    <div class="field"><label for="itemBrand">Marca</label><input id="itemBrand" name="brand" value="${escapeHtml(item.brand || '')}" placeholder="Ex.: Dell, Lenovo"/></div>
    <div class="field full"><label for="itemConservationState">Estado de conservação</label><input id="itemConservationState" name="conservationState" value="${escapeHtml(item.conservation_state || '')}" placeholder="Ex.: Bom, Regular, Novo"/></div>
  `;
  openModal({ eyebrow: id ? 'ATUALIZAR CADASTRO' : 'NOVO CADASTRO', title: id ? 'Editar item' : 'Cadastrar material ou equipamento', submitLabel: id ? 'Salvar alterações' : 'Cadastrar item', body: `<div class="form-grid"><div class="field full"><label for="itemName">Nome do item *</label><input id="itemName" name="name" required value="${escapeHtml(item.name || '')}" placeholder="Ex.: Monitor Dell 24 polegadas"/></div><div class="field"><label for="itemCode">Código *</label><input id="itemCode" name="code" required value="${escapeHtml(item.code || '')}" placeholder="MAT-001 ou PAT-001"/></div><div class="field"><label for="itemCategory">Categoria *</label><input id="itemCategory" name="category" required value="${escapeHtml(item.category || '')}" placeholder="Ex.: Informática"/></div><div class="field"><label for="itemLocation">Localização *</label><input id="itemLocation" name="location" required value="${escapeHtml(item.location || '')}" placeholder="Ex.: Armário A"/></div><div class="field"><label for="itemValue">Valor unitário (R$)</label><input id="itemValue" name="value" type="number" min="0" step="0.01" value="${item.value || 0}"/></div><div class="field"><label for="itemQuantity">Quantidade atual *</label><input id="itemQuantity" name="quantity" type="number" min="0" required value="${item.quantity ?? 1}"/></div><div class="field"><label for="itemMinimum">Estoque mínimo *</label><input id="itemMinimum" name="minimum" type="number" min="0" required value="${item.minimum ?? 1}"/></div><div class="field full"><label><input id="valuableCheckbox" name="valuable" type="checkbox" ${item.valuable ? 'checked' : ''}/> Item de valor que exige termo de posse</label><small>Use para notebooks, celulares, monitores e outros bens patrimoniais.</small></div><div id="extraFields" style="${item.valuable ? '' : 'display:none'}">${extraFields}</div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    try {
      const payload = { ...data, id: id || undefined, quantity: Number(data.quantity), minimum: Number(data.minimum), value: Number(data.value), valuable: Boolean(data.valuable), serialNumber: data.serialNumber || '', brand: data.brand || '', conservationState: data.conservationState || '' };
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
  setTimeout(() => {
    const cb = $('#valuableCheckbox');
    if (cb) cb.addEventListener('change', () => {
      const ef = $('#extraFields');
      if (ef) ef.style.display = cb.checked ? '' : 'none';
    });
  }, 0);
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
  openModal({ eyebrow: 'RESPONSABILIDADE', title: 'Registrar retirada de equipamento', submitLabel: 'Registrar retirada', body: `<div class="form-grid"><div class="field full"><label for="custodyItem">Equipamento *</label><select id="custodyItem" name="inventoryId" required><option value="">Selecione o bem</option>${options}</select>${available.length ? '' : '<small>Não há itens de valor disponíveis. Cadastre ou devolva um equipamento.</small>'}</div><div class="field"><label for="holder">Responsável *</label><input id="holder" name="holder" required placeholder="Nome completo"/></div><div class="field"><label for="holderEmail">E-mail do responsável</label><input id="holderEmail" name="holderEmail" type="email" placeholder="email@dfa.com (para enviar token de aceitação)"/></div><div class="field"><label for="holderDepartment">Setor *</label><input id="holderDepartment" name="department" required placeholder="Ex.: Diretoria"/></div><div class="field"><label for="checkout">Data da retirada *</label><input id="checkout" name="checkout" type="date" value="${todayLocal()}" required/></div><div class="field"><label for="expected">Previsão de devolução *</label><input id="expected" name="expected" type="date" required/></div><div class="field full"><label for="custodyNotes">Estado e observações</label><textarea id="custodyNotes" name="notes" placeholder="Acessórios entregues, estado de conservação e finalidade."></textarea></div></div>`, action: async (form) => {
    const data = Object.fromEntries(new FormData(form));
    const item = state.inventory.find((entry) => entry.id === Number(data.inventoryId));
    if (!item) { showToast('Selecione um equipamento disponível.'); return; }
    try {
      const record = await apiPost('/custody', { inventoryId: item.id, holder: data.holder, holderEmail: data.holderEmail, department: data.department, checkout: data.checkout, expected: data.expected, notes: data.notes });
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
          await reloadSection('movements');
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
        if (item) item.location = updated.previous_location || 'Armário de equipamentos';
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
  connectSSE();
}

function endSession() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  disconnectSSE();
  clearToken();
  currentUser = null;
  state = {
    inventory: [], requests: [], custody: [], movements: [], activity: [],
    dashboard: null, categories: [],
    summaries: { inventory: null },
    stats: { movements: null, custody: null },
    pagination: {},
  };
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
const searchInventory = debounce(() => reloadSection('inventory'));
const searchMovements = debounce(() => reloadSection('movements'));
const searchCustody = debounce(() => reloadSection('custody'));
$('#inventorySearch').addEventListener('input', searchInventory);
['inventoryCategory', 'inventoryStatus'].forEach((id) => $(`#${id}`).addEventListener('change', () => reloadSection('inventory')));
$('#movementSearch').addEventListener('input', searchMovements);
['movementType', 'movementDateFrom', 'movementDateTo'].forEach((id) => $(`#${id}`).addEventListener('change', () => reloadSection('movements')));
$('#custodySearch').addEventListener('input', searchCustody);
$('#custodyStatus').addEventListener('change', () => reloadSection('custody'));
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
    if (result.refreshToken) setRefreshToken(result.refreshToken);
    await startSession(result.user);
  } catch {
    $('#loginError').textContent = 'E-mail ou senha inválidos.';
  }
});

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

$('#logoutButton').addEventListener('click', endSession);

$('#todayLabel').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());

let eventSource = null;
let sseReconnectTimer = null;
let sseReconnectAttempts = 0;
let sseIntentionalDisconnect = false;

const refreshFromServer = debounce(async () => {
  await loadState();
  renderAll();
  if ($('#dashboardPage').classList.contains('active')) window.requestAnimationFrame(renderCharts);
}, 400);

function scheduleSSEReconnect() {
  if (sseIntentionalDisconnect) return;
  clearTimeout(sseReconnectTimer);
  sseReconnectAttempts += 1;
  const delay = Math.min(1000 * 2 ** (sseReconnectAttempts - 1), 30000);
  sseReconnectTimer = window.setTimeout(connectSSE, delay);
}

function tokenExpiresSoon(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 30000;
  } catch { return false; }
}

async function connectSSE() {
  clearTimeout(sseReconnectTimer);
  sseIntentionalDisconnect = false;
  if (eventSource) eventSource.close();
  let token = getToken();
  if (!token) return;
  if (tokenExpiresSoon(token)) {
    try { token = await refreshAuth(); } catch { return; }
  }
  let sseToken;
  try { sseToken = await fetchSseToken(); } catch { scheduleSSEReconnect(); return; }
  eventSource = new EventSource(`/api/events?sid=${encodeURIComponent(sseToken)}`);
  eventSource.addEventListener('open', () => { sseReconnectAttempts = 0; });
  ['inventory', 'requests', 'custody', 'movements'].forEach((event) => {
    eventSource.addEventListener(event, refreshFromServer);
  });
  eventSource.addEventListener('error', () => {
    if (eventSource) eventSource.close();
    eventSource = null;
    scheduleSSEReconnect();
  });
}

function disconnectSSE() {
  sseIntentionalDisconnect = true;
  clearTimeout(sseReconnectTimer);
  if (eventSource) { eventSource.close(); eventSource = null; }
}

const params = new URLSearchParams(window.location.search);
const acceptanceId = params.get('acceptance');
const acceptanceToken = params.get('token');

if (acceptanceId) {
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('auth-hidden');
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
  renderAcceptancePage(acceptanceId, acceptanceToken || '');
  document.body.classList.add('acceptance-mode');
  window.history.replaceState({}, '', window.location.pathname);
} else {
  const savedUser = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  const savedToken = getToken();
  if (savedUser && savedToken) {
    currentUser = savedUser;
    $('#loginScreen').classList.add('hidden');
    $('#appShell').classList.remove('auth-hidden');
    applyPermissions();
    connectSSE();
    loadState().then(() => { renderAll(); window.requestAnimationFrame(renderCharts); });
  } else {
    endSession();
  }
}
