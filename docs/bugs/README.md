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
| 2026-11-07 | Audit logging | Exigir `change_reason` em todo update do `Admin` quebrava specs internos | Alta | #38 | [audit-logging.md](audit-logging.md) |
| 2026-11-07 | Audit logging | PaperTrail falhava com `Psych::DisallowedClass` ao reverter uma versão | Alta | #38 | [audit-logging.md](audit-logging.md) |
| 2026-11-07 | Estrutura de código | `namespace` com `as:` prefixa "admin_" antes do nome, quebrando helper | Alta | #39 | [code-structure.md](code-structure.md) |
| 2026-11-07 | Estrutura de código | `usePage().props.flash` sempre retornava `undefined` | Alta | #39 | [code-structure.md](code-structure.md) |
| 2026-11-07 | Testes e ferramentas | `@testing-library/react` não limpava o DOM entre exemplos | Média | #39 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-07 | Testes e ferramentas | `vi.mock` quebrava referenciando variável externa direto no factory | Baixa | #39 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-07 | Infraestrutura | Fonte do sistema ausente quebrava espaçamento entre palavras | Média | #39 | [infrastructure.md](infrastructure.md) |
| 2026-11-07 | Estrutura de código | Scaffold do Inertia Rails nunca removido, `root_url` dependia dele sem documentar | Média | #41 | [code-structure.md](code-structure.md) |
| 2026-11-07 | Infraestrutura | Gem de `:development` quebrava `bundle exec rspec` inteiro em `RAILS_ENV=test` | Alta | #42 | [infrastructure.md](infrastructure.md) |
| 2026-11-07 | Infraestrutura | Job `test` do CI não gerava `app/frontend/routes.js`, quebrando página que o importa | Alta | #42 | [infrastructure.md](infrastructure.md) |
| 2026-11-07 | Infraestrutura | Dado de bootstrap do RBAC só existia dentro de uma migration, nunca em `db/seeds.rb` | Alta | #45 | [infrastructure.md](infrastructure.md) |
| 2026-11-07 | Testes e ferramentas | `Rails.application.routes.append` num spec causava 404 inconsistente só em CI | Média | #45 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-09 | Estrutura de código | `PanelLayout` não exibia nenhum flash de notice/alert | Alta | #48 | [code-structure.md](code-structure.md) |
| 2026-11-09 | I18n e validação | Campo de quantidade de caracteres do gerador de senha não validava o valor digitado | Média | #48 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-09 | Estrutura de código | `Select` (Radix) avisava "changing from uncontrolled to controlled" por falta de `defaultValues` | Baixa | #48 | [code-structure.md](code-structure.md) |
| 2026-11-09 | Testes e ferramentas | `userEvent.setup()` substitui `navigator.clipboard` por um stub próprio | Média | #48 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-09 | Testes e ferramentas | `react/prop-types` aponta falso positivo quando `usePage().props` é desestruturado como `props` | Baixa | #48 | [testing-and-tooling.md](testing-and-tooling.md) |
| 2026-11-09 | Infraestrutura | PR do Dependabot sempre falhava no job `test` por falta de `RAILS_MASTER_KEY` | Alta | #49 | [infrastructure.md](infrastructure.md) |
| 2026-11-09 | Audit logging | Trocar o papel de um admin não gerava nenhum registro de auditoria | Alta | #50 | [audit-logging.md](audit-logging.md) |
| 2026-11-09 | I18n e validação | Dois campos de "senha atual" na mesma página com o mesmo label | Baixa | #51 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-09 | I18n e validação | Trocar senha autenticado "passaria" sem trocar nada com um password em branco | Média | #51 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-09 | Estrutura de código | `request.get?` sozinho trata requisição HEAD como mutação | Baixa | #51 | [code-structure.md](code-structure.md) |
| 2026-11-09 | 2FA | QR code de configuração do 2FA não aparecia na tela | Alta | #51 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-09 | I18n e validação | Atributos do model `Role` sem tradução pt-BR, erro de validação aparecia em inglês | Baixa | #52 | [i18n-and-data-validation.md](i18n-and-data-validation.md) |
| 2026-11-09 | Audit logging | Revogar permissão de um papel não deixava rastro, e conceder perdia o motivo | Alta | #52 | [audit-logging.md](audit-logging.md) |
| 2026-11-09 | 2FA | Resetar o 2FA de outro admin não validava se o alvo já estava sem 2FA ativo | Baixa | #54 | [two-factor-authentication.md](two-factor-authentication.md) |
| 2026-11-09 | Acessibilidade | `<html>` sem atributo `lang` | Alta | #56 | [accessibility.md](accessibility.md) |
| 2026-11-09 | Acessibilidade | `Dialog` não associava a descrição via `aria-describedby` | Média | #56 | [accessibility.md](accessibility.md) |
| 2026-11-09 | Acessibilidade | Borda de campo inválido com contraste insuficiente (WCAG 1.4.11) | Média | #56 | [accessibility.md](accessibility.md) |
| 2026-11-09 | Acessibilidade | Opções do gerador de senha sem agrupamento semântico | Baixa | #56 | [accessibility.md](accessibility.md) |
| 2026-11-09 | Estrutura de código | Remoção do scaffold padrão (PR #41) não incluiu os assets estáticos | Baixa | #57 | [code-structure.md](code-structure.md) |
| 2026-11-10 | Infraestrutura | Job `test` travava indefinidamente instalando o Chromium, sem nenhum erro no log | Alta | #61 | [infrastructure.md](infrastructure.md) |
| 2026-11-10 | Estrutura de código | Comentário ERB com tag de saída aninhada vazava texto cru pro HTML, quebrando o script de tema | Alta | #62 | [code-structure.md](code-structure.md) |

## Categorias

- [authentication.md](authentication.md) — login, senha, sessão, bloqueio de conta, reset de senha.
- [two-factor-authentication.md](two-factor-authentication.md) — TOTP, códigos de recuperação, fluxo de verificação em duas etapas.
- [audit-logging.md](audit-logging.md) — `AuditEvent`, PaperTrail, precisão/cobertura de log de auditoria.
- [testing-and-tooling.md](testing-and-tooling.md) — RSpec, Vitest, CI, extensões de editor, ferramentas de desenvolvimento.
- [infrastructure.md](infrastructure.md) — banco de dados, cache, criptografia, variáveis de ambiente, deploy.
- [code-structure.md](code-structure.md) — organização de código, namespace, arquitetura, convenção de nomes.
- [i18n-and-data-validation.md](i18n-and-data-validation.md) — locale, tradução, validação de dado em fronteira de confiança.
- [accessibility.md](accessibility.md) — WCAG, ARIA, contraste, navegação por teclado, leitor de tela.

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
