# 0015 - Organização de registro de bugs e changelog

## Status

Aceito. A parte de changelog (onde o índice vive) foi ajustada por `docs/adr/0016-changelog-root-index-with-release-files.md` (índice em `CHANGELOG.md` na raiz, conteúdo detalhado por release continua em `docs/changelog/`). A parte de `docs/bugs/` desta ADR continua vigente, sem mudança.

## Contexto

Ao longo da Fase 3 (autenticação de admin e audit logging, PRs 1-5), vários bugs reais foram encontrados e corrigidos durante a implementação — bloqueio de conta contornável via 2FA, senha de desativação de 2FA sem limite de tentativas, secret de 2FA sobrescrito ao revisitar a tela de setup, eventos de auditoria imprecisos, entre outros. Cada um foi documentado de forma ad-hoc: às vezes como uma convenção em `CONTRIBUTING.md` (quando generalizava para uma pegadinha de framework/teste reaproveitável em outro lugar do projeto), às vezes só em comentário de código e mensagem de commit (quando era específico de uma feature, sem lição generalizável). Não existia um registro centralizado e pesquisável com o histórico completo de bugs reais encontrados — nem um mecanismo de changelog, já que o projeto nunca teve uma versão/tag publicada.

Isso cria dois problemas distintos. Primeiro, não há onde confirmar rapidamente se um tipo de bug já apareceu antes sem vasculhar histórico de commits e ADRs; `CONTRIBUTING.md` só guarda a lição quando ela generaliza, não o bug em si com seu contexto completo (causa raiz, como foi encontrado, impacto). Segundo, não existe nenhum lugar que resuma, em termos de produto/comportamento, o que mudou de uma versão para outra — o que importa para quem opera um deploy deste template, não só para quem lê o código.

## Decisão

Dois sistemas de documentação novos, com propósitos diferentes e não unificados em um só:

**`docs/bugs/`** — registro completo e detalhado de todo bug real encontrado no projeto, sempre, independente de generalizar ou não. Índice em `docs/bugs/README.md`, uma tabela (Data | Categoria | Título | Severidade | PR | Arquivo) apontando para arquivos separados por categoria: `authentication.md`, `two-factor-authentication.md`, `audit-logging.md`, `testing-and-tooling.md`, `infrastructure.md`, `code-structure.md`, `i18n-and-data-validation.md`. Cada bug segue um template fixo: O que aconteceu / Causa raiz / Como foi encontrado / Impacto / Correção / Verificação. Isso é adicional a `CONTRIBUTING.md` (que continua recebendo a lição curta e acionável quando o bug generaliza para uma convenção de código/teste) e a ADR/`docs/environment-setup.md` para os casos que já tinham lugar certo (decisão de arquitetura, pegadinha de ambiente) — `docs/bugs/` nunca substitui esses lugares, é o relato completo que nenhum deles guarda por si só.

**`docs/changelog/`** — versionamento semântico (SemVer) a partir de `v0.1.0`, já que o projeto nunca teve tag/versão publicada antes disso. Índice em `docs/changelog/README.md`, uma tabela (Versão | Data | PRs | Resumo) apontando para um arquivo por versão. `docs/changelog/unreleased.md` acumula entradas no formato Keep a Changelog (`## Adicionado` / `## Corrigido` / `## Alterado`), escritas em termos de produto/comportamento visível, não de detalhe de implementação, até a primeira versão ser fechada e esse conteúdo migrar para seu próprio arquivo de versão.

A diferença de propósito entre os dois é intencional: changelog é o que mudou, para quem usa/opera o template; `docs/bugs/` é o porquê de uma correção específica, para quem desenvolve o template (incluindo agentes de IA evitando repetir um erro já catalogado).

Nova regra de processo, registrada em `CLAUDE.md` (não aqui — é instrução para agentes de IA, não decisão de arquitetura em si): toda PR que corrigir um bug real ganha entrada em `docs/bugs/<categoria>.md`; toda PR que alterar comportamento ganha entrada em `docs/changelog/unreleased.md`; `docs/bugs/README.md` é lido antes de qualquer trabalho não trivial.

## Consequências

- Bug real passa a ter sempre dois lugares possíveis de registro, não um: `docs/bugs/<categoria>.md` (sempre) e, quando aplicável, `CONTRIBUTING.md`/ADR/`docs/environment-setup.md` (quando generaliza). Mais disciplina de escrita por PR, em troca de um histórico pesquisável que nenhum desses arquivos sozinho mantinha.
- A partir de `v0.1.0`, toda mudança de comportamento real exige decidir a entrada de changelog no mesmo PR — não é um exercício retroativo de reconstruir o que mudou a partir do git log.
- Os bugs já encontrados durante a Fase 3 (PRs 1-5) e o changelog do que já foi entregue (identidade de admin, eventos de auditoria, login/bloqueio, reset de senha, 2FA) ainda precisam ser populados retroativamente nesses sistemas — isso é trabalho de uma etapa separada, não deste ADR, que só estabelece a estrutura.
- Se o projeto adotar futuramente uma ferramenta de rastreamento de bugs externa (ex. GitHub Issues com mais rigor, Linear), isso não substitui `docs/bugs/` sem um novo ADR — a decisão aqui é que o registro completo vive versionado junto do código, pesquisável sem depender de serviço externo.
