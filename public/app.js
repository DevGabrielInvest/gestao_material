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
  connectSSE();
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

function connectSSE() {
  if (eventSource) eventSource.close();
  const token = getToken();
  if (!token) return;
  eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);
  eventSource.addEventListener('inventory', () => { loadState(); });
  eventSource.addEventListener('requests', () => { loadState(); });
  eventSource.addEventListener('custody', () => { loadState(); });
  eventSource.addEventListener('movements', () => { loadState(); });
  eventSource.addEventListener('error', () => {
    eventSource.close();
    eventSource = null;
  });
}

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
