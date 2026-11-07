# Registro de bugs

Registro completo e detalhado de todo bug real encontrado neste projeto, organizado por categoria. Ver `docs/adr/0015-bug-tracking-and-changelog-organization.md` para o porquê deste sistema existir e como ele se relaciona com `CONTRIBUTING.md` (lição curta e acionável, quando generaliza) e com ADRs/`docs/environment-setup.md` (decisão de arquitetura, pegadinha de ambiente).

**Leia este índice antes de qualquer trabalho não trivial.** O objetivo é não repetir um erro já catalogado aqui.

## Índice

| Data | Categoria | Título | Severidade | PR | Arquivo |
| --- | --- | --- | --- | --- | --- |

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
