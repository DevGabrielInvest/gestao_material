# Gestão Patrimonial - Daniel Frederighi Advogados Associados

Sistema web local para controle de materiais, equipamentos, solicitações e termos de posse do escritório Daniel Frederighi Advogados Associados.

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
