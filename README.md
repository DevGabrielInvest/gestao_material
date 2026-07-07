# Gestão Patrimonial - Daniel Frederighi Advogados Associados

Sistema web para controle de materiais, equipamentos, solicitações e termos de posse.

## Funcionalidades

- Inventário com estoque mínimo e valor patrimonial
- Entradas e saídas com fornecedor, destino, documento e responsável
- Solicitações com aprovação, justificativa e histórico auditável
- Termos de responsabilidade exportáveis em PDF
- Alertas de reposição, devolução atrasada e pedidos pendentes
- Relatórios de consumo, inventário e bens por responsável, com exportação em PDF
- Exportação CSV financeira com centro de custo, fornecedor/destino, documento/NF, aprovador, data de decisão, status e valores estimados

## Requisitos

- Node.js 18+
- Uma database no [Neon](https://neon.tech) (PostgreSQL serverless)

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto com sua connection string do Neon:

```
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<resultado de: openssl rand -base64 64>
PORT=3000
```

`JWT_SECRET` precisa ter pelo menos 32 bytes aleatórios. Gere um valor próprio, por exemplo:

```bash
openssl rand -base64 64
```

3. Execute as migrações para criar as tabelas:

```bash
npm run schema
```

4. Popule o banco com dados iniciais:

```bash
npm run seed
```

5. Inicie o servidor:

```bash
npm start
```

6. Acesse `http://localhost:3000`

## Acessos de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@dfa.com` | `admin123` |
| Gestor | `gestor@dfa.com` | `gestor123` |
| Solicitante | `colaborador@dfa.com` | `solicitar123` |
| Consulta | `consulta@dfa.com` | `consulta123` |

## Scripts disponíveis

- `npm start` — Inicia o servidor de produção
- `npm run dev` — Inicia com watch mode (reinicia automaticamente)
- `npm run schema` — Cria as tabelas no banco de dados
- `npm run seed` — Popula o banco com dados iniciais

Para testes, configure sempre `TEST_DATABASE_URL` apontando para um banco isolado. O projeto falha em `NODE_ENV=test` quando essa variável não existe, para evitar escrita acidental em `DATABASE_URL`.

## Arquitetura

- **Frontend:** HTML/CSS/JS puro (SPA) servido como arquivo estático
- **Backend:** Node.js + Express com API REST
- **Banco de dados:** PostgreSQL via Neon (serverless)
- **Autenticação:** JWT com bcryptjs
