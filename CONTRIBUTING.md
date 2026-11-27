# Contribuindo

Obrigado pelo interesse em contribuir com este template open source de e-commerce. Este documento descreve o processo esperado.

## Antes de abrir um PR

1. Leia o [`README.md`](README.md) para entender o que é o projeto, e os ADRs em [`docs/adr/`](docs/adr/) para as decisões de arquitetura já fixadas e seus porquês.
2. Leia as convenções de código em [`docs/contributing/`](docs/contributing/) (índice abaixo) — todo código novo precisa seguir Clean Code, Clean Architecture e SOLID como baseline, não como aspiração (ver `docs/adr/0004-clean-architecture-solid-as-baseline.md`).
3. Para mudanças com impacto arquitetural (nova dependência estrutural, mudança de como camadas se relacionam, etc.), proponha ou já inclua um ADR em `docs/adr/` explicando o porquê — veja `docs/adr/0001-record-architecture-decisions.md`.
4. Abra uma issue descrevendo o problema/proposta antes de começar um trabalho grande, para alinhar escopo e abordagem.

## Reportando bugs

Abra uma issue com: passos para reproduzir, comportamento esperado vs. observado, e ambiente (versão de Ruby/Node, navegador, se relevante). Para vulnerabilidades de segurança, **não** abra uma issue pública — veja [`SECURITY.md`](SECURITY.md).

## Convenções de código

Organizadas por área, pra ficar fácil de achar a regra certa sem precisar ler um documento só gigante — leia a(s) relevante(s) pro que você está mudando antes de abrir o PR:

- [Estilo de código e arquitetura](docs/contributing/code-style-and-architecture.md) — Clean Code/SOLID, nomes, valor mágico, namespace, comentários, tags de pendência (TODO/FIXME).
- [Backend (Ruby/Rails)](docs/contributing/backend-conventions.md) — roteamento, PaperTrail/auditoria, `db/seeds.rb`, limites de coluna, gotcha de ERB.
- [Frontend (React/TypeScript)](docs/contributing/frontend-conventions.md) — hierarquia de componente/arquivo, formulário/Radix, TypeScript, tema escuro, React 19/hooks, `js-routes`, flash/Toast.
- [Internacionalização (I18n)](docs/contributing/i18n.md) — convenção de chave de tradução, backend e frontend.
- [Acessibilidade](docs/contributing/accessibility.md) — checklist além do que o lint já cobre.
- [Testes](docs/contributing/testing.md) — convenção por tipo de teste, comandos de verificação local.
- [Segurança](docs/contributing/security.md) — prática de desenvolvimento (ver [`SECURITY.md`](SECURITY.md) para reportar uma vulnerabilidade).

## Processo de PR

0. `pnpm install` já ativa os git hooks do projeto (Husky — ver seção "Git hooks" abaixo); nenhum passo manual.
1. Fork do repositório, **um branch por mudança** a partir de `main` — não misture várias mudanças não relacionadas no mesmo branch. Nome do branch segue um padrão fixo, ver "Padrão de nome de branch" abaixo.
2. Commits em português, no padrão **Commitizen/Conventional Commits** (`tipo: descrição` — tipo em inglês por convenção da ferramenta: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`; descrição/corpo em português), bem detalhados sobre tudo que foi feito e por quê — nunca mensagens genéricas como "ajustes" ou "fix".
3. **Sempre abra um PR** (nunca commit direto na `main`), com descrição **detalhada o suficiente pra uma revisão de código de verdade** — não um resumo genérico. Liste os arquivos relevantes tocados e o porquê, qualquer decisão tomada durante a implementação que não estava no escopo original (ex. um bug encontrado e corrigido no caminho), e o resultado das verificações locais (lint/teste/build). Linke a issue relacionada se houver.
4. **PRs pequenos e focados** — um PR resolve uma coisa. Se a mudança crescer e passar a resolver várias coisas não relacionadas, quebre em PRs menores.
5. **Revise seu próprio diff antes de abrir o PR** — releia as mudanças, rode lint/testes relevantes localmente, confira que nada ficou pela metade. Não abra PR só na esperança de que o CI pegue os problemas.
6. CI (lint, segurança, testes) precisa passar antes do review.
7. Se o PR formalizar uma decisão de arquitetura/produto nova (não só implementação de algo já decidido), inclua o ADR correspondente no mesmo PR — ver `docs/adr/0001-record-architecture-decisions.md` e a skill `create-adr`.
8. **Referencie um PR em qualquer comentário de código, ADR ou documentação sempre pelo número real (`#NN`, o que o GitHub atribui ao abrir o PR), nunca por um codinome/letra informal** (ex. "PR K", "PR J") usado só durante o planejamento. Um codinome não aparece em nenhum lugar público do projeto (título do PR, branch, commit) e não significa nada pra quem lê o código depois — vira referência órfã. Enquanto o PR ainda não tem número (durante a própria implementação), não cite nenhum identificador: descreva a decisão em termos do projeto, sem precisar apontar pra qual PR a introduziu.

### Git hooks

Husky gerencia os hooks de git, ativados automaticamente por `pnpm install` (script `prepare` do `package.json`) — sem passo manual.

- **`pre-commit`** (`.husky/pre-commit`): roda [lint-staged](https://github.com/lint-staged/lint-staged) (`lint-staged.config.mjs`) — ESLint + Prettier nos arquivos `.ts`/`.tsx`/`.js`/`.jsx` staged, Prettier em `.json`/`.css`/`.yml`/`.yaml`, Rubocop (`-a`, autocorreção segura) em `.rb`. Só toca o que está staged, rápido por natureza.
- **`commit-msg`** (`.husky/commit-msg`): roda [commitlint](https://commitlint.js.org/) (`commitlint.config.mjs`, estende `@commitlint/config-conventional`) validando o padrão Conventional Commits do passo 2 acima, e em seguida o bloqueio de atribuição de IA (ver "Sem atribuição de IA" abaixo).
- **`pre-push`** (`.husky/pre-push`): roda a suíte completa (`bundle exec rspec` e `pnpm test`) — intencionalmente mais pesado que o pre-commit, só roda ao empurrar pra um remoto, não a cada commit local.

### Padrão de nome de branch

```text
<tipo>/<descricao-curta-em-ingles>
```

- **`<tipo>`**: exatamente o mesmo vocabulário dos commits — `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.
- **`<descricao-curta-em-ingles>`**: kebab-case, sempre em inglês (mesmo o resto do projeto sendo em português — igual ao nome de arquivo de ADR), curta e descritiva do que a branch faz, não do ticket/issue.
- Exemplos: `feat/coupon-discount-calculator`, `fix/digital-access-release-bug`, `docs/environment-setup-runbook`, `chore/enable-docker-wsl-integration`, `refactor/checkout-service-extraction`.
- Nunca um nome genérico (`fix/bug`, `feat/updates`) nem baseado só em número de issue sem descrição.

## Sem atribuição de IA

Nunca inclua qualquer atribuição de autoria de IA (`Co-Authored-By: Claude`, "Generated with Claude Code", `noreply@anthropic.com` ou equivalente) em commits, PRs ou qualquer artefato deste repositório — mesmo que a ferramenta usada para contribuir tenha gerado essa linha por padrão, remova-a antes de commitar. Isso é bloqueado tecnicamente em duas camadas:

- **Hook local** (`.husky/commit-msg`): rejeita o commit antes mesmo de ser criado. Ativado automaticamente por `pnpm install` (ver "Git hooks" acima).
- **CI** (`.github/workflows/no-ai-attribution.yml`): verifica commits e o corpo/título do PR, como segunda camada de proteção caso o hook local seja ignorado ou não esteja ativado.

**Isso não significa que IA não possa ser usada no desenvolvimento.** Pode, e este projeto é construído com auxílio de IA — a única exigência é que ela nunca apareça como colaboradora/co-autora no repositório (questão de organização/estética, não uma restrição sobre a ferramenta usada). Código produzido com ou sem auxílio de IA passa pelos mesmos padrões deste documento, sem exceção: Clean Code/Clean Architecture/SOLID, nomes descritivos, sem string mágica, HTML semântico, testes de verdade, lint e segurança limpos.

## Código de conduta

Este projeto segue o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
