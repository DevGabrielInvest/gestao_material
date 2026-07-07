let refreshingPromise = null;

async function refreshAuth() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Sem refresh token');
  if (refreshingPromise) return refreshingPromise;
  refreshingPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearToken();
        currentUser = null;
        throw new Error('Sessão expirada');
      }
      const data = await res.json();
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      return data.token;
    } finally {
      refreshingPromise = null;
    }
  })();
  return refreshingPromise;
}

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
      if (res.status === 401 && token && options._refreshed !== true) {
        try {
          const newToken = await refreshAuth();
          return api(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` }, _refreshed: true });
        } catch {
          endSession();
          throw new Error('Sua sessão expirou. Faça login novamente.');
        }
      }
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

async function fetchSseToken() {
  const data = await apiPost('/events/token', {});
  return data.token;
}

async function apiDownload(path, fallbackName) {
  const token = getToken();
  let res = await fetch(`/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (res.status === 401 && token) {
    const newToken = await refreshAuth();
    res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${newToken}` } });
  }
  if (!res.ok) {
    let message = 'Erro ao exportar arquivo';
    try { message = (await res.json()).error || message; } catch { /* resposta sem JSON */ }
    throw new Error(message);
  }
  const match = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') || '');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = match ? match[1] : fallbackName;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { window.clearTimeout(timer); timer = window.setTimeout(() => fn(...args), delay); };
}

function sectionQuery(section) {
  const params = new URLSearchParams();
  if (section === 'inventory') {
    const term = $('#inventorySearch').value.trim();
    const category = $('#inventoryCategory').value;
    const status = $('#inventoryStatus').value;
    if (term) params.set('search', term);
    if (category && category !== 'all') params.set('category', category);
    if (status && status !== 'all') params.set('status', status);
  } else if (section === 'movements') {
    const term = $('#movementSearch').value.trim();
    const type = $('#movementType').value;
    if (term) params.set('search', term);
    if (type && type !== 'all') params.set('type', type);
    if ($('#movementDateFrom').value) params.set('dateFrom', $('#movementDateFrom').value);
    if ($('#movementDateTo').value) params.set('dateTo', $('#movementDateTo').value);
  } else if (section === 'custody') {
    const term = $('#custodySearch').value.trim();
    const status = $('#custodyStatus').value;
    if (term) params.set('search', term);
    if (status && status !== 'all') params.set('status', status);
  }
  const query = params.toString();
  return query ? `&${query}` : '';
}

function applyListResponse(section, response) {
  state[section] = response.data || response;
  state.pagination[section] = response.total !== undefined
    ? { total: response.total, limit: response.limit, offset: response.offset, hasMore: response.hasMore }
    : null;
  if (response.summary) state.summaries[section] = response.summary;
  if (response.stats) state.stats[section] = response.stats;
}

async function loadState() {
  try {
    const requesterOnly = currentUser?.role === 'requester';
    const emptyList = { data: [], total: 0, limit: 0, offset: 0, hasMore: false };
    const results = requesterOnly
      ? [emptyList, await apiGet('/requests?limit=50&offset=0'), emptyList, emptyList, emptyList, null, []]
      : await Promise.all([
        apiGet(`/inventory?limit=100&offset=0${sectionQuery('inventory')}`),
        apiGet('/requests?limit=50&offset=0'),
        apiGet(`/custody?limit=50&offset=0${sectionQuery('custody')}`),
        apiGet(`/movements?limit=50&offset=0${sectionQuery('movements')}`),
        apiGet('/activity?limit=20&offset=0'),
        apiGet('/dashboard'),
        apiGet('/inventory/categories'),
      ]);
    applyListResponse('inventory', results[0]);
    applyListResponse('requests', results[1]);
    applyListResponse('custody', results[2]);
    applyListResponse('movements', results[3]);
    applyListResponse('activity', results[4]);
    state.dashboard = results[5];
    state.categories = Array.isArray(results[6]) ? results[6] : [];
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showToast(err.message || 'Não foi possível carregar os dados agora.');
  }
}

const reloadSeq = {};

async function reloadSection(section) {
  if (currentUser?.role === 'requester' && section !== 'requests') return;
  const seq = (reloadSeq[section] || 0) + 1;
  reloadSeq[section] = seq;
  try {
    const limit = state.pagination[section]?.limit || 50;
    const response = await apiGet(`/${section}?limit=${limit}&offset=0${sectionQuery(section)}`);
    if (reloadSeq[section] !== seq) return;
    applyListResponse(section, response);
    if (section === 'inventory') renderInventory();
    else if (section === 'custody') renderCustody();
    else if (section === 'movements') renderMovements();
  } catch (err) {
    console.error(`Erro ao filtrar ${section}:`, err);
    showToast(err.message || 'Erro ao aplicar os filtros.');
  }
}

async function loadMore(section) {
  if (currentUser?.role === 'requester' && section !== 'requests') return;
  try {
    const pagInfo = state.pagination[section];
    if (!pagInfo || !pagInfo.hasMore) return;
    const newOffset = pagInfo.offset + pagInfo.limit;
    const response = await apiGet(`/${section}?limit=${pagInfo.limit}&offset=${newOffset}${sectionQuery(section)}`);
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
