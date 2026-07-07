# Vulnerabilidades achadas Codex

Auditoria iniciada em 2026-07-06 e aprofundada em 2026-07-07 no diretório `/home/ia01/Documentos/gestao_material`.

## Escopo verificado

- Backend Node.js/Express em `server/`.
- Frontend SPA estático em `public/`.
- Migrações, seed, testes e scripts npm.
- Estado atual do workspace local e risco de divergência entre código local e produção.

## Resumo executivo

Foram encontrados riscos reais de segurança e necessidades operacionais. O ponto mais urgente da segunda varredura é que o refresh token pode ser aceito como token de API, porque o middleware só valida assinatura e não valida tipo/audiência do token. Isso amplia uma sessão de API para a vida do refresh token. Também há vazamento potencial de JWT pelo fluxo de SSE: o frontend coloca o token na URL e o logger registra a URL completa. Além disso, há problema de autorização/privacidade: perfis autenticados, inclusive solicitante, conseguem carregar dados amplos do sistema por API, mesmo quando a navegação é escondida no frontend.

O `npm audit --omit=dev --json` retornou 0 vulnerabilidades conhecidas nas dependências de produção no momento da auditoria. A checagem sintática com `node --check` em `server/*.js`, `server/routes/*.js` e `public/*.js` passou.

## Situação pós-correções

### Corrigido no código

- Refresh token não é mais aceito como Bearer token de API.
- JWT ganhou `type`, `audience`, `issuer` e validação explícita no middleware.
- Refresh tokens agora são persistidos, rotacionados e revogados no logout.
- SSE deixou de usar access token na query string e passou a usar token efêmero próprio.
- Logs de requisição agora redigem a query string.
- Leitura de inventário, custódia, movimentações, dashboard e atividade foi restringida para `requester`.
- Criação, aprovação, recusa e entrega de solicitação passaram a usar transações mais consistentes com histórico.
- A entrega não marca mais solicitação como entregue quando falta estoque.
- Exportações CSV agora neutralizam fórmulas de planilha.
- `TEST_DATABASE_URL` passou a ser obrigatória em `NODE_ENV=test`.
- `healthcheck` público foi reduzido para resposta mínima.
- `.gitignore` passou a cobrir `.playwright-cli/` e `output/playwright/`.

### Ainda falta fazer

- Aplicar a migração `server/migrations/004_security_sessions_constraints.sql` no banco de destino.
- Executar a suíte de integração com `TEST_DATABASE_URL` isolada para validar os fluxos alterados.
- Remover do Git os artefatos já rastreados em `.playwright-cli/` e `output/playwright/`, se o objetivo for limpar o histórico do repositório.
- Planejar a atualização de dependências com majors disponíveis, especialmente `express`.
- Fechar os itens estruturais que dependem de decisão de deploy: healthcheck detalhado, migrações automáticas no pipeline e eventualmente o modelo de SSE/serverless.

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

## Achados adicionais da segunda varredura

### A1. Refresh token pode ser aceito como access token

**Severidade:** Crítica/Alta

**Evidência:**

- `server/routes/auth.js:31-36` cria access token sem `type` e refresh token com `type: 'refresh'`, ambos assinados com o mesmo `JWT_SECRET`.
- `server/routes/auth.js:49-52` coloca no payload do refresh token os mesmos dados de identidade/autorização usados pelo access token: `id`, `name`, `email`, `role`, `department`.
- `server/middleware.js:4-12` aceita qualquer JWT assinado no header `Authorization: Bearer ...`; não rejeita `decoded.type === 'refresh'`.
- `server/config.js:71-72` define access token de 24h e refresh token de 7d.

**Impacto:**

Um refresh token roubado não serve apenas para renovar sessão: ele pode ser enviado diretamente como Bearer token para rotas protegidas por `authMiddleware`. Na prática, o limite de acesso à API deixa de ser 24h e passa a ser o tempo do refresh token. Isso também contorna a intenção de separar token curto de acesso e token longo de renovação.

**Correção recomendada:**

- Adicionar `type: 'access'` aos access tokens e exigir esse tipo no `authMiddleware`.
- Rejeitar explicitamente `type: 'refresh'` em qualquer rota de API que não seja `/api/auth/refresh`.
- Usar `audience`, `issuer` e `algorithms` explícitos em `jwt.sign`/`jwt.verify`.
- Considerar segredos diferentes para access e refresh token, ou chaves/claims separados.
- Criar teste: login, pegar `refreshToken`, chamar `/api/auth/me` com ele no Bearer e exigir `401`.

### A2. Entrega de solicitação pode ser gravada mesmo quando falta estoque

**Severidade:** Alta

**Evidência:**

- `server/routes/requests.js:129-132` atualiza a solicitação para `status = 'delivered'` logo no início da transação.
- `server/routes/requests.js:135-140` só depois busca o inventário e verifica saldo.
- `server/routes/requests.js:139-140` retorna `{ status: 409 }` quando falta estoque, mas esse retorno não lança erro nem força rollback.
- `server/routes/requests.js:153-155` responde 409 ao cliente, mas a alteração anterior de status pode já ter sido confirmada pela transação.

**Impacto:**

Uma entrega sem saldo suficiente pode deixar o pedido como `delivered` no banco, mesmo com resposta HTTP 409. Isso gera divergência entre solicitação, histórico, movimentação e estoque. É uma falha de integridade operacional: o usuário vê erro, mas o estado pode mudar.

**Correção recomendada:**

- Mover a validação de inventário/saldo antes do `UPDATE requests SET status = 'delivered'`.
- Ou lançar erro/rollback dentro da transação quando faltar saldo.
- Inserir movimentação, histórico e alteração de status na mesma transação, só no caminho de sucesso.
- Criar teste específico: solicitação aprovada com quantidade maior que estoque deve responder 409 e permanecer `approved`.

### A3. Aprovação/recusa/criação de solicitação não são atômicas com histórico

**Severidade:** Média/Alta

**Evidência:**

- `server/routes/requests.js:63-73` cria solicitação e depois insere histórico em query separada.
- `server/routes/requests.js:88-96` aprova solicitação e depois insere histórico em query separada.
- `server/routes/requests.js:110-118` recusa solicitação e depois insere histórico em query separada.

**Impacto:**

Se a atualização da solicitação for confirmada e o insert de histórico falhar, o sistema pode mudar o estado do pedido sem trilha auditável correspondente. Como o produto promete histórico auditável, isso enfraquece uma garantia central do fluxo.

**Correção recomendada:**

- Envolver criação, aprovação, recusa e respectivos inserts de `request_history` em `sql.begin`.
- Em caso de falha no histórico, fazer rollback da mudança de status.
- Adicionar testes que simulem falha ou validem que cada mudança de status tem entrada de histórico.

### A4. Exportações CSV são vulneráveis a CSV/Formula Injection

**Severidade:** Média/Alta

**Evidência:**

- `server/routes/reports.js:48-53` escapa aspas, delimitador e quebra de linha, mas não neutraliza valores iniciados por `=`, `+`, `-`, `@`, tab ou carriage return.
- `server/routes/reports.js:171-186` exporta inventário com campos vindos do banco.
- `server/routes/reports.js:190-237` exporta movimentações com campos como item, fornecedor/destino, documento, responsável e observações.
- `server/routes/reports.js:241-315` exporta financeiro com justificativas e observações.

**Impacto:**

Um usuário com permissão para inserir nomes, documentos, fornecedores ou observações pode gravar algo como `=HYPERLINK(...)` ou fórmula equivalente. Quando alguém abrir o CSV no Excel/LibreOffice, a planilha pode executar ou avaliar a fórmula. Isso é especialmente relevante porque o sistema orienta abrir CSV no Excel.

**Correção recomendada:**

- Na função `buildCsv`, prefixar com apóstrofo valores que comecem com `=`, `+`, `-`, `@`, tab ou carriage return.
- Aplicar sanitização antes de montar qualquer CSV.
- Criar teste com item/documento começando por `=cmd|...` ou `=HYPERLINK(...)` e validar que o CSV sai neutralizado.

### A5. Cobertura de testes não protege os principais riscos de autorização

**Severidade:** Média

**Evidência:**

- Os testes rejeitam `requester` em escritas como `POST /api/inventory`, `POST /api/custody` e `POST /api/movements`.
- Os testes também rejeitam `requester` em relatórios.
- Não foi encontrado teste garantindo que `requester` não leia `GET /api/inventory`, `GET /api/custody`, `GET /api/movements`, `GET /api/dashboard`, `GET /api/activity` ou `GET /api/inventory/categories`.
- Não foi encontrado teste garantindo que refresh token não funciona como Bearer token.
- Não foi encontrado teste garantindo que o logger redige `token` em URL.

**Impacto:**

As regressões mais perigosas hoje são justamente as que a suíte não cobre. O sistema pode continuar passando em `npm test` mesmo expondo dados amplos para perfis de baixa permissão.

**Correção recomendada:**

- Criar matriz de testes por perfil e endpoint.
- Adicionar casos negativos para `requester` nas leituras sensíveis.
- Adicionar caso específico para refresh token usado como Bearer token.
- Adicionar teste unitário de logger com URL contendo `?token=abc`.

### A6. Dependências sem vulnerabilidade conhecida, mas com majors disponíveis

**Severidade:** Baixa/Média

**Evidência:**

- `npm audit --omit=dev --json` retornou 0 vulnerabilidades conhecidas.
- `npm outdated --json` apontou:
  - `bcryptjs`: atual `2.4.3`, latest `3.0.3`.
  - `dotenv`: atual `16.6.1`, latest `17.4.2`.
  - `express`: atual `4.22.2`, latest `5.2.1`.

**Impacto:**

Não é vulnerabilidade imediata pelo audit, mas indica dívida de manutenção. Express 5 pode exigir ajustes de compatibilidade; por isso não é atualização para fazer às cegas em produção.

**Correção recomendada:**

- Planejar atualização em branch separada.
- Rodar suíte completa com banco de teste isolado.
- Para Express 5, revisar middlewares, handlers async e comportamento de roteamento.

### A7. Healthcheck público expõe estado de banco e uptime

**Severidade:** Baixa

**Evidência:**

- `server/routes/health.js:7-15` deixa `/api/health` público, consulta o banco e retorna `uptime`.

**Impacto:**

É comum healthcheck ser público, mas ele revela que o banco está alcançável e há quanto tempo o processo está vivo. Isso ajuda diagnóstico legítimo, mas também dá sinal operacional a terceiros.

**Correção recomendada:**

- Manter público só se a plataforma de deploy precisar.
- Reduzir resposta pública para `{ ok: true }`.
- Criar healthcheck detalhado protegido por token interno ou disponível apenas em rede privada.

### A8. `JWT_SECRET` só é obrigatório, não é validado por força

**Severidade:** Média

**Evidência:**

- `server/config.js:3-19` exige presença de `JWT_SECRET`, mas não valida tamanho, entropia mínima ou placeholder.
- `README.md:31-33` mostra `JWT_SECRET=uma-chave-segura-aqui`, mas não define requisito objetivo.

**Impacto:**

Um segredo curto ou previsível compromete todos os JWTs. Como access e refresh token compartilham o mesmo segredo, o impacto de um segredo fraco é maior.

**Correção recomendada:**

- Exigir mínimo de 32 bytes aleatórios, idealmente 64.
- Bloquear valores óbvios ou placeholders.
- Documentar comando para gerar segredo, por exemplo `openssl rand -base64 64`.
- Separar segredos de access e refresh se o modelo de tokens continuar em JWT.

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
- `.gitignore:1-4` ignora `node_modules/`, `.env`, `output/pdf/` e `tmp/`, mas não ignora `.playwright-cli/` nem `output/playwright/`.

**Impacto:**

Mesmo que sejam credenciais de demonstração, snapshots e PDFs gerados podem carregar dados de teste, telas internas, nomes, valores e eventualmente tokens ou credenciais reais no futuro.

**Correção recomendada:**

- Adicionar `.playwright-cli/`, `output/playwright/` e outros artefatos gerados ao `.gitignore`.
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
- `npm outdated --json`: majors disponíveis para `bcryptjs`, `dotenv` e `express`.
- `npm ls --omit=dev --depth=0`: dependências instaladas resolvidas corretamente.
- `node --check` em arquivos JS de `server/`, `server/routes/`, `public/` e `test/`: sem erro sintático.
- `node --test test/logger.test.js`: passou.
- `.env` foi inspecionado sem exibir valores; contém `DATABASE_URL`, `JWT_SECRET` e `PORT`, mas não `TEST_DATABASE_URL`.
- Testes de integração foram revisados e ampliados estaticamente para cobrir as lacunas de autorização e integridade.
- `git status --short`: o workspace agora contém as alterações de correção, este relatório atualizado e a migração nova. Ainda assim, se produção vier de outro commit/branch, valide o deploy antes de assumir que os achados refletem produção.

## Validação não executada

- `npm test` não foi executado porque o projeto permite cair para `DATABASE_URL` quando `TEST_DATABASE_URL` não existe. Isso pode tocar o banco real/compartilhado. Primeiro configure um banco isolado de teste.

## Próximos passos recomendados

1. Impedir refresh token como Bearer token de API.
2. Corrigir vazamento de JWT do SSE e mascaramento de logs.
3. Corrigir a transação de entrega para não marcar pedido como entregue quando faltar estoque.
4. Restringir endpoints por perfil e ajustar `loadState()` para não baixar dados proibidos.
5. Implementar revogação/rotação persistente de refresh tokens.
6. Neutralizar CSV/Formula Injection nas exportações.
7. Isolar banco de testes e tornar `TEST_DATABASE_URL` obrigatório em `NODE_ENV=test`.
8. Limpar artefatos rastreados de `.playwright-cli/` e `output/playwright/` e ampliar `.gitignore`.
