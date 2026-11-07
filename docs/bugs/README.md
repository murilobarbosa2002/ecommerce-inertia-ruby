# Registro de bugs

Registro completo e detalhado de todo bug real encontrado neste projeto, organizado por categoria. Ver `docs/adr/0015-bug-tracking-and-changelog-organization.md` para o porquê deste sistema existir e como ele se relaciona com `CONTRIBUTING.md` (lição curta e acionável, quando generaliza) e com ADRs/`docs/environment-setup.md` (decisão de arquitetura, pegadinha de ambiente).

**Leia este índice antes de qualquer trabalho não trivial.** O objetivo é não repetir um erro já catalogado aqui.

## Índice

| Data | Categoria | Título | Severidade | PR | Arquivo |
| --- | --- | --- | --- | --- | --- |
| 2026-11-03 | Testes e ferramentas | `*.test.tsx` dentro de `app/frontend/pages/` vazava pro build | Alta | #10 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-04 | I18n e validação | `rails-i18n` não traduz `password_too_long` | Baixa | #24 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-04 | I18n e validação | Coluna `:string` do Postgres sem limite de tamanho | Média | #24 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-04 | Testes e ferramentas | Rake task com `exit`/`abort` derrubava o RSpec | Alta | #24 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-04 | Autenticação | Unicidade de e-mail do admin não era case-insensitive | Média | #25 | [authentication.md](authentication.md) |
| 2026-11-04 | Estrutura de código | Namespace `Admin::` colidia com o model `Admin` | Média | #28 | [code-structure.md](code-structure.md) |
| 2026-11-04 | Testes e ferramentas | `rack-attack` é no-op por `:null_store` em teste | Alta | #28 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-04 | Testes e ferramentas | Todo Tree sem o binário `ripgrep` instalado | Baixa | #29 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-04 | Testes e ferramentas | Todo Tree configurado com chave errada | Baixa | #29 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-04 | Audit logging | Logout do admin não gerava evento de auditoria | Média | #30 | [audit-logging.md](audit-logging.md) |
| 2026-11-04 | Autenticação | Token de `generates_token_for` não-determinístico no teste | Média | #31 | [authentication.md](authentication.md) |
| 2026-11-04 | I18n e validação | Teste de tradução I18n tautológico com `I18n.t()` | Média | #31 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-04 | 2FA | Verificação de 2FA não checava bloqueio de conta | Crítica | #32 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-04 | 2FA | Desativar 2FA com senha errada sem limite de tentativas | Alta | #32 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-04 | 2FA | Revisitar setup do 2FA sobrescrevia o secret ativo | Alta | #32 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-04 | 2FA | Código TOTP idêntico na mesma janela de 30s no teste | Baixa | #32 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-04 | Audit logging | `login_failed` reusado entre login e reautenticação de 2FA | Média | #32 | [audit-logging.md](audit-logging.md) |
| 2026-11-04 | Audit logging | `login_succeeded` disparado antes do login terminar (2FA) | Média | #32 | [audit-logging.md](audit-logging.md) |
| 2026-11-04 | Infraestrutura | CI sem `RAILS_MASTER_KEY` pro job de teste | Alta | #33 | [infrastructure.md](infrastructure.md) |
| 2026-11-05 | Infraestrutura | CVEs do Rails 8.1.4 (um crítico) sinalizados pelo bundler-audit | Crítica | #36 | [infrastructure.md](infrastructure.md) |
| 2026-11-07 | Testes e ferramentas | `markdownlint` sinalizava falso positivo no template de `docs/bugs/` | Baixa | #37 | [testing-and-tooling.md](testing-and-tooling.md) |

## Categorias

- [authentication.md](authentication.md) — login, senha, sessão, bloqueio de conta, reset de senha.
- [two-factor-authentication.md](two-factor-authentication.md) — TOTP, códigos de recuperação, fluxo de verificação em duas etapas.
- [audit-logging.md](audit-logging.md) — `AuditEvent`, PaperTrail, precisão/cobertura de log de auditoria.
- [testing-and-tooling.md](testing-and-tooling.md) — RSpec, Vitest, CI, extensões de editor, ferramentas de desenvolvimento.
- [infrastructure.md](infrastructure.md) — banco de dados, cache, criptografia, variáveis de ambiente, deploy.
- [code-structure.md](code-structure.md) — organização de código, namespace, arquitetura, convenção de nomes.
- [i18n-and-data-validation.md](i18n-and-data-validation.md) — locale, tradução, validação de dado em fronteira de confiança.

## Template de entrada

Toda entrada em um arquivo de categoria segue este formato:

```markdown
## Título curto do bug

- **Data:** AAAA-MM-DD
- **Severidade:** baixa | média | alta | crítica
- **PR:** #NN

### O que aconteceu

### Causa raiz

### Como foi encontrado

### Impacto

### Correção

### Verificação
```
