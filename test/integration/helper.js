import { createServer } from 'node:http';
import app from '../../server/app.js';
import sql from '../../server/db.js';

let server;
let baseUrl;

export async function startServer() {
  return new Promise((resolve) => {
    server = createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
}

export async function stopServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
}

export function getBaseUrl() {
  return baseUrl;
}

let adminTokenCache;
export async function adminToken() {
  if (adminTokenCache) return adminTokenCache;
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@dfa.com', password: 'admin123' }),
  });
  const data = await res.json();
  adminTokenCache = data.token;
  return adminTokenCache;
}

let managerTokenCache;
export async function managerToken() {
  if (managerTokenCache) return managerTokenCache;
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gestor@dfa.com', password: 'gestor123' }),
  });
  const data = await res.json();
  managerTokenCache = data.token;
  return managerTokenCache;
}

let requesterTokenCache;
export async function requesterToken() {
  if (requesterTokenCache) return requesterTokenCache;
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'colaborador@dfa.com', password: 'solicitar123' }),
  });
  const data = await res.json();
  requesterTokenCache = data.token;
  return requesterTokenCache;
}

export async function api(method, path, options = {}) {
  const { body, token } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.headers.get('content-type')?.includes('json')
    ? await res.json()
    : await res.text();
  return { status: res.status, data };
}

export { sql };
