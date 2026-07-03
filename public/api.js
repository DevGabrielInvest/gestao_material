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
