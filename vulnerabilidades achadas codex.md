# Vulnerabilidades achadas Codex

Auditoria realizada em 2026-07-06 no diretório `/home/ia01/Documentos/gestao_material`.

## Escopo verificado

- Backend Node.js/Express em `server/`.
- Frontend SPA estático em `public/`.
- Migrações, seed, testes e scripts npm.
- Estado atual do workspace local, que possui alterações não commitadas em vários arquivos.

## Resumo executivo

Foram encontrados riscos reais de segurança e necessidades operacionais. O ponto mais urgente é o vazamento potencial de JWT pelo fluxo de SSE: o frontend coloca o token na URL e o logger registra a URL completa. Também há problema de autorização/privacidade: perfis autenticados, inclusive solicitante, conseguem carregar dados amplos do sistema por API, mesmo quando a navegação é escondida no frontend.

O `npm audit --omit=dev --json` retornou 0 vulnerabilidades conhecidas nas dependências de produção no momento da auditoria. A checagem sintática com `node --check` em `server/*.js`, `server/routes/*.js` e `public/*.js` passou.

## Achados críticos e altos

### 1. JWT exposto em query string do SSE e nos logs

**Severidade:** Alta

**Evidência:**

- `public/app.js:548` cria `EventSource('/api/events?token=...')`.
- `server/routes/events.js:8-11` aceita token via `req.query.token`.
- `server/app.js:50` aplica `requestLoggingMiddleware` em todas as rotas `/api`.
- `server/logger.js:67` e `server/logger.js:87` registram `req.originalUrl`, incluindo query string.

**Impacto:**

O JWT pode aparecer em logs locais, logs de hospedagem, proxy, ferramentas de observabilidade e histórico de requisições. Como esse token é bearer, qualquer pessoa com acesso ao log pode agir como o usuário até a expiração do token.

**Correção recomendada:**

- Parar de autenticar SSE por query string.
- Usar cookie `HttpOnly`, `Secure`, `SameSite` para a sessão, ou criar um token efêmero de SSE de uso único e curta duração.
- Redigir logs imediatamente: registrar `pathname` sem query ou mascarar parâmetros sensíveis como `token`, `refreshToken`, `password`.
- Adicionar teste garantindo que `/api/events?token=...` nunca grave o token em log.

### 2. Controle de acesso incompleto em leituras sensíveis

**Severidade:** Alta

**Evidência:**

- `server/routes/inventory.js:18` permite `GET /api/inventory` para qualquer usuário autenticado.
- `server/routes/custody.js:29` permite `GET /api/custody` para qualquer usuário autenticado.
- `server/routes/movements.js:12` permite `GET /api/movements` para qualquer usuário autenticado.
- `server/routes/dashboard.js:10` e `server/routes/dashboard.js:58` permitem dashboard e atividade para qualquer usuário autenticado.
- `public/api.js:135-145` carrega inventário, solicitações, custódia, movimentações, atividade, dashboard e categorias logo após login, independentemente do perfil.
- `public/utils.js:132-133` só esconde páginas para solicitante no frontend; isso não bloqueia acesso à API.

**Impacto:**

Um usuário `requester` pode receber ou consultar dados de inventário, valores patrimoniais, termos de posse, responsáveis, movimentações e atividade do sistema. Isso é vazamento de informação interna e também quebra a separação entre perfil de solicitante e perfis gerenciais.

**Correção recomendada:**

- Definir matriz de autorização por rota no backend.
- Bloquear `inventory`, `custody`, `movements`, `dashboard` e `activity` para `requester`, ou devolver apenas dados estritamente necessários.
- Fazer o frontend chamar apenas endpoints permitidos para o perfil logado.
- Criar testes de integração para cada perfil, principalmente `requester`.

### 3. Refresh token stateless e logout sem revogação real

**Severidade:** Alta

**Evidência:**

- `server/routes/auth.js:35-36` cria refresh token com `jti`, mas não persiste esse identificador.
- `server/routes/auth.js:56-81` renova tokens só verificando assinatura e existência do usuário.
- `server/routes/auth.js:85-87` implementa logout como `res.json({ ok: true })`, sem autenticar nem revogar token.
- `server/config.js:71-72` usa access token de 24h e refresh token de 7d.
- `public/utils.js:139-143` armazena access token e refresh token em `sessionStorage`.

**Impacto:**

Se um refresh token for roubado, ele continua válido até expirar. Logout limpa apenas o navegador atual, mas não invalida tokens já emitidos. A rotação atual emite novo refresh token, mas não impede reuso do token antigo.

**Correção recomendada:**

- Criar tabela de sessões/refresh tokens com `jti` hasheado, `user_id`, `expires_at`, `revoked_at` e metadados.
- Revogar refresh token no logout.
- Rotacionar refresh token invalidando o anterior.
- Considerar `token_version` por usuário para invalidar todas as sessões após troca de senha ou incidente.

## Achados médios

### 4. Testes podem usar banco real quando `TEST_DATABASE_URL` não existe

**Severidade:** Média

**Evidência:**

- `server/config.js:21-30` usa `DATABASE_URL` em `NODE_ENV=test` quando `TEST_DATABASE_URL` não está definida.
- `server/testCleanup.js:5-14` também cai para `DATABASE_URL` e apenas registra aviso.

**Impacto:**

Rodar testes de integração ou cleanup em máquina apontada para banco compartilhado/produtivo pode inserir, alterar ou apagar fixtures. O cleanup tenta filtrar padrões de teste, mas ainda é perigoso por depender de convenção de nomes.

**Correção recomendada:**

- Em `NODE_ENV=test`, exigir `TEST_DATABASE_URL` e falhar se ela não existir.
- Separar banco/branch Neon específico para testes.
- Marcar scripts destrutivos com proteção adicional, por exemplo exigir `ALLOW_TEST_DB_CLEANUP=true`.

### 5. Artefatos de Playwright e saídas geradas estão versionados

**Severidade:** Média

**Evidência:**

- `git ls-files .playwright-cli` encontrou 71 arquivos rastreados.
- `git grep` encontrou snapshots `.playwright-cli/page-*.yml` contendo `admin123`.
- `git ls-files output` mostra screenshots gerados em `output/playwright`.
- `.gitignore` ignora apenas `node_modules/` e `.env`.

**Impacto:**

Mesmo que sejam credenciais de demonstração, snapshots e PDFs gerados podem carregar dados de teste, telas internas, nomes, valores e eventualmente tokens ou credenciais reais no futuro.

**Correção recomendada:**

- Adicionar `.playwright-cli/`, `output/`, `tmp/` e artefatos gerados ao `.gitignore`.
- Remover do Git os arquivos já rastreados, sem apagar necessariamente do disco local.
- Se alguma senha desses snapshots foi usada fora de demo, rotacionar.

### 6. Filtros de consulta aceitam strings sem limite e datas sem validação em listas

**Severidade:** Média

**Evidência:**

- `server/routes/inventory.js:27` usa `search` em múltiplos `ILIKE`.
- `server/routes/requests.js:24`, `server/routes/custody.js:35` e `server/routes/movements.js:18` fazem o mesmo.
- `server/routes/requests.js:28-29`, `server/routes/custody.js:39-40` e `server/routes/movements.js:23-24` aplicam `dateFrom/dateTo` sem validar formato.
- `server/config.js:59-61` limita a API a 300 req/min, mas isso ainda permite consultas pesadas repetidas.

**Impacto:**

Um usuário autenticado pode enviar buscas muito longas ou datas inválidas para provocar carga desnecessária no banco, erros 500 e degradação. Não parece SQL injection porque o projeto usa parametrização, mas é risco de disponibilidade.

**Correção recomendada:**

- Limitar tamanho de `search`, `category`, `status`, `type` e demais query params.
- Reutilizar `DATE_REGEX` e validação real de data nas listas, não só em relatórios.
- Criar índices adequados para buscas frequentes ou usar busca dedicada se crescer.
- Reduzir limites máximos quando o perfil não for gerencial.

### 7. CSP ainda depende de `unsafe-inline` e o frontend usa muito `innerHTML`

**Severidade:** Média

**Evidência:**

- `server/config.js:74-87` define CSP, mas `styleSrc` inclui `'unsafe-inline'`.
- `public/app.js` e `public/components.js` têm vários usos de `innerHTML`.
- A maioria dos dados dinâmicos usa `escapeHtml`, mas o padrão de renderização facilita regressões futuras.

**Impacto:**

Não encontrei um XSS direto confirmado nas rotas revisadas, porém a superfície é grande. Um único campo novo renderizado sem `escapeHtml` pode virar XSS armazenado, e XSS neste sistema roubaria tokens do `sessionStorage`.

**Correção recomendada:**

- Padronizar renderização segura com helpers que escapam por padrão.
- Evitar `innerHTML` para dados do banco quando possível.
- Se mantiver templates HTML, adicionar testes/lint simples para campos não escapados.
- No médio prazo, remover `unsafe-inline` da CSP com classes CSS em vez de estilos inline.

## Necessidades estruturais do sistema

### 8. Modelo de deploy ainda é Express de longa duração com SSE

**Severidade:** Média, se o alvo continuar sendo Vercel/serverless

**Evidência:**

- `server/index.js` inicializa `app.listen(PORT, ...)`.
- `server/index.js` chama `initPubSub()` e mantém processo vivo.
- `server/routes/events.js` mantém conexão SSE aberta.
- Não há `vercel.json` nem pasta `api/` no estado verificado.

**Impacto:**

Esse formato é adequado para servidor Node persistente, mas tende a falhar ou ficar instável em serverless tradicional. Env vars (`DATABASE_URL`, `JWT_SECRET`) são necessárias, mas não resolvem incompatibilidade de runtime.

**Correção recomendada:**

- Se for usar Vercel, criar entrada serverless compatível e substituir SSE por polling, WebSocket gerenciado ou provider compatível.
- Se for manter SSE, hospedar em runtime persistente: VPS, Render, Railway, Fly.io, Docker etc.
- Documentar claramente o alvo oficial de deploy.

### 9. Schema depende demais da aplicação para preservar invariantes

**Severidade:** Média

**Evidência:**

- `server/migrations/001_initial_schema.sql:11-23` não define `UNIQUE` para `inventory.code`.
- `server/migrations/001_initial_schema.sql:25-41` não define `CHECK` para `requests.status`, `priority` ou `quantity > 0`.
- `server/migrations/001_initial_schema.sql:54-69` não define `CHECK` para `custody.status`.
- `server/migrations/001_initial_schema.sql:71-84` valida `movements.type`, mas não valida quantidade positiva.

**Impacto:**

Se dados forem inseridos por script, migração manual, console SQL ou bug de API, o banco aceita estados inválidos. Isso pode quebrar relatórios, estoque e permissões de fluxo.

**Correção recomendada:**

- Adicionar constraints: `inventory.code UNIQUE`, quantidades não negativas/positivas conforme tabela, status e prioridade por `CHECK`.
- Adicionar migração de limpeza antes das constraints se já houver dados fora do padrão.
- Criar testes de migração para garantir que a produção aceita a alteração.

### 10. Migrações não são aplicadas automaticamente no start/deploy

**Severidade:** Baixa a média

**Evidência:**

- `package.json:7-14` tem scripts separados `start`, `schema` e `seed`.
- `server/migrate.js:15-42` aplica migrações, mas apenas quando `npm run schema` é executado.
- `README.md:36-45` instrui rodar schema e seed manualmente.

**Impacto:**

Ambiente novo pode subir com aplicação apontando para banco sem schema atualizado. Isso causa falhas de runtime que parecem bug de código ou problema de env.

**Correção recomendada:**

- Adicionar etapa de migração no pipeline de deploy.
- Registrar versão aplicada em healthcheck administrativo.
- Não rodar seed automaticamente em produção; exigir comando explícito e senhas fortes.

### 11. Credenciais de demonstração aparecem no README e no seed

**Severidade:** Baixa a média

**Evidência:**

- `README.md:56-63` lista e-mails e senhas demo.
- `server/seed.js:6-11` define senhas padrão.
- `server/seed.js:29-37` bloqueia defaults em `NODE_ENV=production`, o que é positivo.

**Impacto:**

O bloqueio em produção reduz o risco, mas qualquer ambiente que não esteja com `NODE_ENV=production` pode ser populado com contas conhecidas. Se esse ambiente ficar exposto, o acesso é trivial.

**Correção recomendada:**

- Manter bloqueio em produção.
- Marcar README como credenciais locais apenas.
- Exigir senhas via env em qualquer deploy remoto, não só produção.
- Considerar remover senhas reais da documentação e mostrar placeholders.

## Pontos positivos encontrados

- Consultas revisadas usam o cliente `postgres` com interpolação parametrizada; não encontrei SQL injection direto nas rotas principais.
- `helmet` e rate limit já estão configurados.
- Login usa comparação com hash dummy para reduzir enumeração por timing.
- Operações sensíveis de estoque, entrega e exclusão usam transações e `FOR UPDATE`.
- Erros 500 retornam mensagem genérica com `requestId`.
- `npm audit --omit=dev` retornou zero vulnerabilidades conhecidas nas dependências de produção.

## Validações executadas

- `npm audit --omit=dev --json`: 0 vulnerabilidades.
- `npm ls --omit=dev --depth=0`: dependências instaladas resolvidas corretamente.
- `node --check` em arquivos JS de `server/`, `server/routes/` e `public/`: sem erro sintático.
- `git status --short`: há alterações locais não commitadas em arquivos de aplicação. Este relatório reflete o workspace atual, não necessariamente o que está em produção.

## Validação não executada

- `npm test` não foi executado porque o projeto permite cair para `DATABASE_URL` quando `TEST_DATABASE_URL` não existe. Isso pode tocar o banco real/compartilhado. Primeiro configure um banco isolado de teste.

## Próximos passos recomendados

1. Corrigir vazamento de JWT do SSE e mascaramento de logs.
2. Restringir endpoints por perfil e ajustar `loadState()` para não baixar dados proibidos.
3. Implementar revogação/rotação persistente de refresh tokens.
4. Isolar banco de testes e tornar `TEST_DATABASE_URL` obrigatório em `NODE_ENV=test`.
5. Limpar artefatos rastreados de `.playwright-cli/` e `output/` e ampliar `.gitignore`.
