## Objective
- Implementar testes automatizados unitários, de segurança, integração e frontend no sistema gestão-patrimonial.

## Important Details
- Node v24.15.0, ES Modules (`"type": "module"`)
- Framework de teste nativo `node:test` + `node:assert/strict`
- DB externo PostgreSQL via `postgres` npm — testes de integração exigem `TEST_DATABASE_URL` real
- Frontend é SPA vanilla JS (sem framework), arquivos em `public/` com globais (`window.*`)
- Playwright chromium_headless_shell-1228 instalado, jsdom instalado
- Testes de frontend usam JSDOM com `runScripts: 'dangerously'`, código-fonte transformado com `let/const → var` para expor globais no `window`

## Work State
### Completed
- 146 testes passando (0 falhando):
  - `test/cache.test.js` (7): get/setCache, TTL, invalidate por prefixo e completo
  - `test/config.test.js` (8): exports, pagination, regex, JWT constants, validation limits, EMAIL_CONFIG, status/priority constants, security constants
  - `test/email.test.js` (5): buildAcceptanceEmail, buildPdfEmail, sendEmail skip em test
  - `test/middleware.test.js` (10): authMiddleware (token ausente, inválido, refresh, audience errada, assinatura diferente), roleMiddleware (allow, deny, multi-role)
  - `test/validation.test.js` (32): validateString/Number/Enum/Email/Date, optionalQuery*, parsePositiveId, validateInventoryBody, todayLocal, edge cases (Feb 31, Infinity, negative)
  - `test/logger.test.js` (9): logWarn, logError, serializeError (Error + non-Error)
  - `test/events.test.js` (3): addClient, closeAllClients, handler error em end()
  - `test/acceptance.test.js` (10): detectBrowser — Chrome, Firefox, Safari, Edge, Opera, IE, Linux, Android, macOS, iOS, unknown
  - `test/pdf.test.js` (8): moneyLabel, dateOnly, dateLabel — valores nulos, formatação
  - `test/security/security.test.js` (6): headers helmet (6 headers), JSON inválido, logout sem token, OPTIONS, health mínimo, 404 sem vazamento
  - `test/frontend-utils.test.js` (24): escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField (8), statusBadge (request+ custody + unknown), can (perm roles), canOpenPage, visibleRequests (requester + admin), getAlerts, addActivity
  - `test/frontend-api.test.js` (9): debounce (2), GET sem token, Authorization header, POST body, network error, retry 5xx, PUT, DELETE, 401+refresh
  - `test/frontend-components.test.js` (7): state init, navigate, showToast, openModal, closeModal, setLoading disable, setLoading restore
  - `test/frontend-app.test.js` (6): acceptanceStatusBadge (pending/token_sent/completed/unknown), tokenExpiresSoon (expiring/valid/malformed/missing exp)
  - `test/frontend-charts.test.js` (2): setupCanvas (ctx/w/h + devicePixelRatio scaling)
- Integração (requer DB): `test/integration/security.test.js` (8), `test/integration/acceptance.test.js` (9), `test/integration/events.test.js` (6)
- Autorização complementar: requester bloqueado em PUT/DELETE inventory, PUT return custody, GET pdf custody, DELETE movements, approve/reject/deliver requests, GET pdf reports
- `playwright.config.js` criado: chromium headless, port 3099, webServer aponta para `node server/index.js`
- `e2e/auth.spec.js`, `e2e/permissions.spec.js`, `e2e/crud.spec.js`: testes Playwright (não executados — dependem de DB)
- Scripts npm: `test`, `test:coverage`, `test:coverage:all`, `test:unit`, `test:integration`, `test:security`, `security:check`

### Active
- (none)

### Blocked
- Playwright E2E tests (`e2e/*.spec.js`) e `test/integration/*.test.js` — exigem `TEST_DATABASE_URL` apontando para PostgreSQL real
- Cobertura total (`npm run test:coverage:all`) requer DB para integração

## Next Move
1. Executar `npm run test:unit` (146 testes, sem DB)
2. Executar E2E via `npx playwright test` (requer DB + servidor rodando em 3099)

## Relevant Files
- `test/frontend-utils.test.js` (24): escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField (8), statusBadge (3), can (4 roles), canOpenPage, visibleRequests (2), getAlerts, addActivity (JSDOM)
- `test/frontend-api.test.js` (9): debounce, api, apiPost, apiPut, apiDelete, retry, network error, 401+refresh (JSDOM)
- `test/frontend-components.test.js` (7): state, navigate, showToast, openModal, closeModal, setLoading (JSDOM)
- `test/frontend-app.test.js` (6): acceptanceStatusBadge, tokenExpiresSoon (JSDOM)
- `test/frontend-charts.test.js` (2): setupCanvas (JSDOM com mock ctx)
- `e2e/auth.spec.js`, `e2e/permissions.spec.js`, `e2e/crud.spec.js`: Playwright
- `playwright.config.js`: port 3099, chromium headless, webServer

## Cobertura atual

### Server (unit tests, sem DB)
| Módulo | Status |
|---|---|
| `server/cache.js` | 7/7 testes |
| `server/config.js` | 28/28 exports testados (todos) |
| `server/email.js` | 5/5 (sendEmail skip + build emails) |
| `server/events.js` | 3/4 (addClient, closeAllClients; notifyChange/initPubSub exigem DB) |
| `server/logger.js` | 9/9 exports testados (todos) |
| `server/middleware.js` | 10/10 (auth + role) |
| `server/pdf.js` | 8/8 (moneyLabel, dateOnly, dateLabel) |
| `server/routes/acceptance.js` | detectBrowser (10) |
| `server/validation.js` | 32/32 (validateString/Number/Enum/Email/Date, optionalQuery*, parsePositiveId, validateInventoryBody, todayLocal, logActivity requer DB) |
| `server/routes/*` | Somente integração (requer DB) |

### Frontend (JSDOM)
| Arquivo | Funções testadas |
|---|---|
| `public/utils.js` | escapeHtml, money, dateOnly, dateLabel, initials, todayLocal, isOverdue, validateField, statusBadge, can, canOpenPage, visibleRequests, getAlerts, addActivity |
| `public/api.js` | debounce, api, apiPost, apiPut, apiDelete |
| `public/components.js` | state, navigate, showToast, openModal, closeModal, setLoading |
| `public/app.js` | acceptanceStatusBadge, tokenExpiresSoon |
| `public/charts.js` | setupCanvas |

### Integração (requer DB)
- `test/integration/auth.test.js`, `security.test.js`, `inventory.test.js`, `requests.test.js`, `custody.test.js`, `movements.test.js`, `dashboard.test.js`, `reports.test.js`, `acceptance.test.js`, `events.test.js`, `health.test.js`

### E2E Playwright (requer DB + servidor)
- `e2e/auth.spec.js`, `e2e/permissions.spec.js`, `e2e/crud.spec.js`
