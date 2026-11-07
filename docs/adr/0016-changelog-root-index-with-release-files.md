# 0016 - Índice de changelog na raiz (`CHANGELOG.md`), conteúdo por release em `docs/changelog/`

## Status

Aceito. Substitui a parte de changelog de `docs/adr/0015-bug-tracking-and-changelog-organization.md` (a parte de `docs/bugs/` dessa ADR continua vigente, sem mudança).

## Contexto

`docs/adr/0015` decidiu organizar o changelog como um diretório (`docs/changelog/`), com um índice em `docs/changelog/README.md` (tabela apontando pra um arquivo por versão) e um `docs/changelog/unreleased.md` acumulando entradas até a primeira versão ser fechada.

O problema identificado não é o conteúdo detalhado por release viver em arquivos separados — isso é consistente com `docs/bugs/`, que já organiza detalhe extenso em arquivos por categoria. O problema é **onde o índice vive**: outros pontos de entrada deste projeto (`README.md`, `CONTRIBUTING.md`) ficam na raiz do repositório, visíveis de imediato pra qualquer pessoa (ou ferramenta) que abra o projeto. Enterrar o índice do changelog dentro de `docs/changelog/README.md` exige já saber que esse diretório existe antes de encontrá-lo — o índice de algo tão fundamental quanto "o que mudou nesse projeto" merece o mesmo nível de visibilidade de `README.md`/`CONTRIBUTING.md`, não um nível a mais de navegação.

## Decisão

**`CHANGELOG.md`, na raiz do repositório, é só o índice**: uma tabela (Versão | Data | PRs | Resumo) listando cada versão lançada (mais recente primeiro) e apontando pro arquivo de detalhe correspondente, mais uma entrada pra "Não lançado". O conteúdo de verdade — o que foi adicionado/corrigido/alterado, no formato Keep a Changelog (`### Adicionado`/`### Corrigido`/`### Alterado`) — continua em `docs/changelog/`: `docs/changelog/unreleased.md` acumula entradas até a primeira versão (`v0.1.0`) ser fechada, quando esse conteúdo migra pra `docs/changelog/v0.1.0.md` (e assim por diante pras versões seguintes), cada um linkado a partir do índice na raiz.

`docs/changelog/README.md` (o índice antigo, dentro do diretório) é removido — o índice passa a existir só na raiz. Isso espelha o padrão já usado por `docs/bugs/`: um índice central navegável + conteúdo detalhado dividido em arquivos, com a única mudança sendo a unidade de divisão (release, não categoria) e a localização do índice (raiz, não dentro do próprio diretório de detalhe).

## Consequências

- `CHANGELOG.md` fica descobrível de imediato na raiz, como `README.md`/`CONTRIBUTING.md` — qualquer pessoa nova no projeto encontra o índice sem precisar já saber que `docs/changelog/` existe.
- Conteúdo detalhado por release continua organizado em arquivos separados, sem inflar um único arquivo conforme o projeto acumula versões — mesmo racional de escala já aplicado a `docs/bugs/`.
- Toda PR que alterar comportamento visível continua obrigada a atualizar `docs/changelog/unreleased.md` (regra já fixada em `CLAUDE.md`); a tabela em `CHANGELOG.md` só ganha uma linha nova quando uma versão é de fato fechada/lançada, não a cada PR.
- `CLAUDE.md`/`README.md` precisam referenciar `CHANGELOG.md` como ponto de entrada (índice) e `docs/changelog/unreleased.md` como onde o conteúdo de cada PR entra de fato.
