# Gestão Patrimonial - Daniel Frederighi Advogados Associados

Sistema web local para controle de materiais, equipamentos, solicitações e termos de posse do escritório Daniel Frederighi Advogados Associados.

## Funcionalidades

- Inventário com estoque mínimo e valor patrimonial.
- Entradas e saídas com fornecedor, destino, documento e responsável.
- Solicitações com aprovação, justificativa e histórico auditável.
- Termos de responsabilidade exportáveis em PDF.
- Alertas de reposição, devolução atrasada e pedidos pendentes.
- Relatórios de consumo, inventário e bens por responsável, com exportação em PDF.

## Executar

Abra `index.html` no navegador ou, nesta pasta, execute:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

Os dados ficam salvos no `localStorage` do navegador. Esta versão é adequada para uso local e demonstração. Para uso simultâneo por várias pessoas, o próximo passo é integrar autenticação e banco de dados.

## Acessos locais de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@dfa.com` | `admin123` |
| Gestor | `gestor@dfa.com` | `gestor123` |
| Solicitante | `colaborador@dfa.com` | `solicitar123` |
| Consulta | `consulta@dfa.com` | `consulta123` |

Essas credenciais e permissões são locais e servem para validar os fluxos antes da integração com o Supabase. Elas não substituem autenticação segura no servidor.
