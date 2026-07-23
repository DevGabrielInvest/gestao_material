# Gestão Patrimonial — Contexto para LLMs

## Visão Geral

Sistema de gestão patrimonial para o escritório **Daniel Frederighi Advogados Associados**.
Controle de inventário, movimentações, solicitações, termos de posse (custódia), aceite
eletrônico, dashboard, relatórios e exportação CSV/PDF.

---

## Stack

| Camada      | Tecnologia                                      |
|-------------|-------------------------------------------------|
| Runtime     | Node.js (v24.15.0), ES Modules (`"type":"module"`) |
| Backend     | Express 4.21, helmet, compression, rate-limit   |
| Database    | PostgreSQL via `postgres` (driver nativo)        |
| Auth        | bcryptjs + jsonwebtoken (access + refresh)       |
| Email       | nodemailer (SMTP configurável)                   |
| PDF         | PDFKit                                           |
| Frontend    | **Vanilla JS SPA** (sem framework)               |
| Testes      | `node:test` + `node:assert/strict` (nativo)      |
| Test FE     | JSDOM 29 (`runScripts: 'dangerously'`)           |
| E2E         | Playwright (chromium headless)                   |

---

## Estrutura de Diretórios

```
/
├── server/                          # Backend Express API
│   ├── index.js                     # Entry point: HTTP server
│   ├── app.js                       # Express app (middleware, routes, static)
│   ├── config.js                    # Constantes: JWT, DB, email, pagination, validation
│   ├── db.js                        # Conexão PostgreSQL (postgres)
│   ├── middleware.js                # authMiddleware + roleMiddleware
│   ├── validation.js                # validateString/Number/Enum/Email/Date etc.
│   ├── cache.js                     # Cache em memória com TTL
│   ├── email.js                     # buildAcceptanceEmail, buildPdfEmail, sendEmail
│   ├── events.js                    # SSE: addClient, closeAllClients, notifyChange, initPubSub
│   ├── logger.js                    # logInfo/Warn/Error, serializeError, requestIdMiddleware
│   ├── pdf.js                       # PDF generation + helpers (moneyLabel, dateOnly, dateLabel)
│   ├── migrate.js + seed.js         # DB schema + seed
│   ├── testCleanup.js               # Limpeza para testes de integração
│   ├── migrations/                  # SQL migrations
│   └── routes/                      # 10 route handlers
│       ├── auth.js                  # POST /login, /refresh, /logout
│       ├── inventory.js             # CRUD /api/inventory
│       ├── requests.js              # CRUD /api/requests + approve/reject/deliver
│       ├── custody.js               # CRUD /api/custody + PDF + return
│       ├── movements.js             # CRUD /api/movements
│       ├── acceptance.js            # send-token, status, verify (e-accept)
│       ├── events.js                # GET /events (SSE stream)
│       ├── dashboard.js             # GET /dashboard (aggregated data)
│       ├── reports.js               # CSV/PDF export routes
│       └── health.js                # GET /health
│
├── public/                          # Frontend SPA (vanilla JS)
│   ├── index.html                   # Entry point
│   ├── styles.css                   # All styles
│   ├── utils.js                     # Funções puras: escapeHtml, money, date, validateField
│   │                                #   statusBadge, can, canOpenPage, getAlerts, addActivity
│   ├── api.js                       # HTTP client: api(), apiGet/Post/Put/Delete, debounce
│   ├── components.js                # UI: state, navigate, showToast, open/closeModal, setLoading
│   ├── app.js                       # App: render* functions, acceptance, init, session
│   ├── charts.js                    # Canvas: setupCanvas, renderCategory/Movement/RequestChart
│   ├── favicon.ico                  # Favicon
│   └── logo DF nova.png             # Logo
│
├── test/                            # Testes
│   ├── acceptance.test.js           # detectBrowser (10)
│   ├── cache.test.js                # get/setCache, TTL, invalidate (7)
│   ├── config.test.js               # Todos exports do config.js (8)
│   ├── email.test.js                # buildAcceptanceEmail, buildPdfEmail, sendEmail skip (5)
│   ├── events.test.js               # addClient, closeAllClients (3)
│   ├── frontend-utils.test.js       # JSDOM: utils.js functions (24)
│   ├── frontend-api.test.js         # JSDOM: api.js functions (9)
│   ├── frontend-components.test.js  # JSDOM: components.js functions (7)
│   ├── frontend-app.test.js         # JSDOM: app.js (acceptanceStatusBadge, tokenExpiresSoon) (6)
│   ├── frontend-charts.test.js      # JSDOM: charts.js setupCanvas (2)
│   ├── logger.test.js               # logWarn/Error, serializeError, middlewares (9)
│   ├── middleware.test.js           # authMiddleware + roleMiddleware (10)
│   ├── pdf.test.js                  # moneyLabel, dateOnly, dateLabel (8)
│   ├── validation.test.js           # validate*, optionalQuery*, parsePositiveId (32)
│   ├── security/
│   │   └── security.test.js         # Helmet headers, JSON inválido, CORS, 404 (6)
│   └── integration/                 ## Requer PostgreSQL real
│       ├── helper.js                # Setup/teardown helper
│       ├── auth.test.js
│       ├── security.test.js         # (8)
│       ├── inventory.test.js
│       ├── requests.test.js
│       ├── custody.test.js
│       ├── movements.test.js
│       ├── dashboard.test.js
│       ├── reports.test.js
│       ├── acceptance.test.js       # (9)
│       ├── events.test.js           # (6)
│       └── health.test.js
│
├── e2e/                             # Playwright E2E ## Requer DB + servidor
│   ├── auth.spec.js
│   ├── permissions.spec.js
│   └── crud.spec.js
│
├── playwright.config.js             # chromium headless, port 3099
├── package.json                     # Scripts npm
├── .env.example                     # Exemplo de variáveis de ambiente
├── AGENTS.md                        # Instruções do agente opencode
└── CONTEXT.md                       # Este arquivo
```

---

## Fluxo de Dados (Frontend)

```
index.html
  └── app.js (on DOMContentLoaded)
       ├── Carrega sessionStorage → currentUser
       ├── applyPermissions() → esconde/mostra nav
       ├── loadState() → apiGet() popula state.*
       └── renderAll() → renderDashboard/Inventory/Requests/Custody/Movements/Reports
```

Os arquivos JS são carregados em ordem no HTML:
1. `utils.js` — funções auxiliares
2. `api.js` — requisições HTTP
3. `components.js` — estado global + UI
4. `charts.js` — gráficos Canvas
5. `app.js` — lógica principal

Todas as funções ficam no escopo global (`window.*`).

---

## Sistema de Permissões

```js
const permissionMap = {
  approve:          ['admin', 'manager'],
  manageInventory:  ['admin', 'manager'],
  manageCustody:    ['admin', 'manager'],
  viewReports:      ['admin', 'manager', 'viewer'],
  request:          ['admin', 'manager', 'requester'],
  viewAllRequests:  ['admin', 'manager', 'viewer'],
};
```

---

## Autenticação

- JWT access token (24h) + refresh token (7d) armazenados em `sessionStorage`
- Refresh automático em 401 (se refresh token válido)
- SSE tokens efêmeros (60s) para eventos em tempo real
- Dupla audience: `access` vs `refresh` (refresh rejeitado como Bearer)

---

## Banco de Dados

PostgreSQL via `postgres` (template tag driver).
Variáveis de ambiente no `.env`:

```
DATABASE_URL=postgres://user:pass@host:5432/gestao_patrimonial
TEST_DATABASE_URL=postgres://user:pass@host:5432/gestao_patrimonial_test
```

Em `NODE_ENV=test`, o `config.js` **exige** `TEST_DATABASE_URL` para impedir escrita
acidental no banco de produção.

Tabelas principais:
- `users` — login, role
- `inventory_items` — equipamentos/materiais
- `requests` — solicitações (pending → approved → delivered / rejected)
- `custody_records` — termos de posse (active → returned)
- `movements` — movimentações de entrada/saída
- `activity_log` — auditoria
- `refresh_tokens` — rotação de refresh tokens
- `acceptance_tokens` — tokens de aceite eletrônico

---

## Testes

### Comando Único

```bash
npm test                               # Todos os testes (inclui integração)
npm run test:unit                      # Só unitários (146 testes, sem DB)
npm run test:integration               # Só integração (requer DB)
npm run test:security                  # Segurança (unit + integration)
npm run test:coverage                  # Cobertura unit + security
npm run test:coverage:all              # Cobertura total (requer DB)
npm run security:check                 # npm audit + JWT_SECRET check
```

### Testes Unitários (146, 0 falhando)

| Arquivo | Testes | O que cobre |
|---------|--------|-------------|
| `config.test.js` | 8 | Todos os exports do config.js |
| `validation.test.js` | 32 | validateString/Number/Enum/Email/Date, optionalQuery*, parsePositiveId, validateInventoryBody |
| `middleware.test.js` | 10 | authMiddleware (6 cenários) + roleMiddleware (allow/deny/multi) |
| `cache.test.js` | 7 | get/set, TTL, invalidate por prefixo/completo |
| `logger.test.js` | 9 | logInfo/Warn/Error, serializeError, requestId/requestLogging middleware, handleRouteError, safeRequestPath |
| `email.test.js` | 5 | buildAcceptanceEmail, buildPdfEmail (com/sem buffer), sendEmail skip |
| `events.test.js` | 3 | addClient, closeAllClients (normal + erro) |
| `pdf.test.js` | 8 | moneyLabel, dateOnly, dateLabel (valores nulos e formatação) |
| `acceptance.test.js` | 10 | detectBrowser (Chrome, Firefox, Safari, Edge, Opera, IE, Android, iOS, macOS, Linux, unknown) |
| `security/security.test.js` | 6 | Helmet headers, JSON inválido, logout sem token, OPTIONS, health, 404 |
| `frontend-utils.test.js` | 24 | escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField (8), statusBadge (3), can (4 roles), canOpenPage, visibleRequests (2), getAlerts, addActivity |
| `frontend-api.test.js` | 9 | debounce (delay + leading), api GET/POST/PUT/DELETE, network error, retry 5xx, 401+refresh |
| `frontend-components.test.js` | 7 | state init, navigate, showToast, openModal, closeModal, setLoading (disable + restore) |
| `frontend-app.test.js` | 6 | acceptanceStatusBadge (4), tokenExpiresSoon (4) |
| `frontend-charts.test.js` | 2 | setupCanvas (ctx/w/h + devicePixelRatio) |

### Testes de Integração (requerem DB real)

| Arquivo | O que cobre |
|---------|-------------|
| `auth.test.js` | Login, refresh, logout, refresh rotation, token inválido |
| `security.test.js` (8) | SQL injection, SSE token, refresh rotation, logout revocation, XSS, strings longas, token adulterado |
| `inventory.test.js` | CRUD + autorização (requester bloqueado em PUT/DELETE) |
| `requests.test.js` | CRUD + approve/reject/deliver + autorização |
| `custody.test.js` | CRUD + PDF + return + autorização |
| `movements.test.js` | CRUD + autorização (requester bloqueado em DELETE) |
| `dashboard.test.js` | Agregações do dashboard |
| `reports.test.js` | CSV/PDF export + autorização |
| `acceptance.test.js` (9) | send-token (403/404/400/409), status, verify |
| `events.test.js` (6) | SSE token (auth, admin, requester), GET /events sem/sid inválido |
| `health.test.js` | Health check |

### E2E Playwright (requerem DB + servidor rodando)

| Arquivo | O que cobre |
|---------|-------------|
| `auth.spec.js` | Login form, invalid credentials, valid login, session persistence, logout |
| `permissions.spec.js` | Admin/Manager/Requester nav items, acesso a páginas |
| `crud.spec.js` | Navegar para inventory, criar + buscar item |

---

## Cobertura (Unit + Security)

| Módulo Server | Status |
|---------------|--------|
| `server/config.js` | 100% (28/28 exports) |
| `server/validation.js` | 100% (logActivity requer DB) |
| `server/middleware.js` | 100% (auth + role) |
| `server/cache.js` | 100% (3/3 exports) |
| `server/logger.js` | 100% (9/9 exports) |
| `server/email.js` | 100% (sendEmail skip + build emails) |
| `server/pdf.js` | 100% (3/3 exports) |
| `server/routes/acceptance.js` | `detectBrowser` (1/1 export) |
| `server/events.js` | 2/4 (addClient/closeAllClients OK; notifyChange/initPubSub DB) |

| Módulo Frontend | Status |
|-----------------|--------|
| `public/utils.js` | escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField, statusBadge, can, canOpenPage, visibleRequests, getAlerts, addActivity |
| `public/api.js` | debounce, api, apiGet, apiPost, apiPut, apiDelete |
| `public/components.js` | state, navigate, showToast, openModal, closeModal, setLoading |
| `public/app.js` | acceptanceStatusBadge, tokenExpiresSoon |
| `public/charts.js` | setupCanvas |

---

## Convenções de Código

1. **ES Modules** — `import`/`export` em todo o código (server + test)
2. **Server** — `function` declarations para middlewares e route handlers
3. **Frontend** — `function` declarations para funções globais, `const` arrow para puras
4. **Testes** — `import test from 'node:test'` + `import assert from 'node:assert/strict'`
5. **Frontend tests** — JSDOM com `runScripts: 'dangerously'`, código transformado com
   `let/const → var` para expor globais no `window`
6. **Mocks** — Atribuição direta em `dom.window.fetch`, `dom.window.sessionStorage` etc.
   (`test.mock.module()` **não** disponível nesta versão do Node)

---

## Variáveis de Ambiente (`.env`)

```
DATABASE_URL=postgres://...
TEST_DATABASE_URL=postgres://...        # Obrigatória em NODE_ENV=test
JWT_SECRET=...                          # Mínimo 32 bytes
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@exemplo.com
EMAIL_PASS=...
EMAIL_FROM=noreply@exemplo.com
EMAIL_SECURE=false
BASE_URL=http://localhost:3000
PORT=3000
ACCEPTANCE_TOKEN_EXPIRY=60
```

---

## Gaps Conhecidos (Pendências)

### Bloqueados por DB PostgreSQL
- `server/events.js`: `notifyChange`, `initPubSub` (sql.notify)
- `server/validation.js`: `logActivity` (escrita em activity_log)
- `server/email.js`: caminho real do sendEmail (SMTP)
- `test/integration/*.test.js` (11 arquivos)
- `e2e/*.spec.js` (3 arquivos)

### Cobertura total (`npm run test:coverage:all`)
- Requer DB para integração

---

## Scripts Úteis

```bash
npm run test:unit        # 146 testes (30s)
npm run dev              # Servidor com --watch
npm start                # Produção
npm run schema           # Rodar migrations
npm run seed             # Popular DB com dados iniciais
npx playwright test      # E2E (requer DB + servidor em 3099)
```
