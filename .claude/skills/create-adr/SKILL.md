---
name: create-adr
description: Use esta skill sempre que for criar ou propor um novo Architecture Decision Record (ADR) para este projeto, ou atualizar o status de um ADR existente (ex. marcar como superseded). Cobre o formato, a numeração e o processo obrigatório de ler todos os ADRs existentes antes de escrever.
---

# Criar um ADR neste projeto (skill: create-adr)

## O que é um ADR aqui

Um Architecture Decision Record registra uma decisão de arquitetura/produto relevante **e, principalmente, o porquê dela** — não só o que foi decidido, mas o contexto que levou à decisão e as consequências aceitas. ADRs vivem em `docs/adr/` e são a fonte de verdade sobre decisões (ver `docs/adr/0001-record-architecture-decisions.md`, que formalizou essa prática).

**Importante:** um ADR documenta uma decisão que o mantenedor já tomou (nesta conversa ou fora dela) — esta skill não serve para esta skill "decidir" arquitetura sozinha. Se for pedido para criar um ADR sobre algo que ainda não foi claramente decidido pelo mantenedor, pare e pergunte antes de formalizar como decisão (ver regra "nunca decidir sozinho" em `CLAUDE.md`).

## Passo 1 — leia TODOS os ADRs existentes antes de escrever qualquer coisa

Isso não é opcional. Antes de criar um novo ADR:

1. Liste `docs/adr/` para ver os números já usados.
2. Leia o conteúdo completo de cada ADR existente (não só o título) — isso ensina:
   - qual é o próximo número sequencial disponível;
   - decisões já tomadas, para não contradizer ou duplicar uma sem perceber;
   - o tom e estilo de escrita já estabelecido (português, direto, sem linguagem de "equipe"/plural quando o projeto é de mantenedor único, sem citar clientes reais — ver `README.md` e a seção de contribuição em `CONTRIBUTING.md` para o tom geral do projeto);
   - como ADRs se referenciam entre si (`docs/adr/000X-titulo-em-kebab-case.md`) e referenciam `README.md`/`CONTRIBUTING.md` quando relevante.
3. **ADRs nunca referenciam `CLAUDE.md`.** ADRs são documentação para humanos; `CLAUDE.md` é só para agentes de IA (ver seção "Onde encontrar o quê" em `CLAUDE.md`). Se o ADR precisar apontar para onde um padrão de código/processo está documentado, aponte para `CONTRIBUTING.md` ou `README.md`.

## Passo 2 — numeração e nome de arquivo

- Número sequencial, zero-padded com 4 dígitos (`0001`, `0002`, ..., `0010`, ...), sempre o próximo disponível — nunca reutilize ou pule números.
- **Nome do arquivo sempre em inglês**, kebab-case: `NNNN-short-title-in-english.md` (ex. `0008-docker-allowed-for-auxiliary-tooling.md`) — é o padrão de todos os ADRs existentes, mesmo o conteúdo sendo em português. Não traduza o nome do arquivo para português; só o corpo do documento é em português.
- Título do documento (`# NNNN - Título Legível em Português`) deve ser curto e descrever a decisão, não o problema (ex. "Licença open source MIT", não "Como licenciar o projeto"). O título dentro do arquivo é em português — só o nome do arquivo é em inglês.

## Passo 3 — estrutura obrigatória (formato Nygard, usado em todos os ADRs deste projeto)

```markdown
# NNNN - Título da decisão

## Status

Aceito

## Contexto

O que motivou a decisão: o problema, as alternativas consideradas, e por que isso importa especificamente para este projeto (template white-label open source de produtos digitais — ver `README.md` para o contexto geral, que toda decisão deve respeitar).

## Decisão

O que foi decidido, de forma direta e concreta.

## Consequências

- O que essa decisão implica na prática (positivo e negativo/trade-off aceito).
- Como isso afeta decisões futuras ou outros ADRs.
- Quando relevante, o que faria essa decisão ser revisitada.
```

- `Status` é normalmente `Aceito`. Só muda para algo como `Superseded by 00NN` quando uma decisão é formalmente substituída por um ADR novo — isso é a ÚNICA edição permitida em um ADR já existente (ver próxima seção).
- Sem emojis, sem linguagem de equipe/plural (é um mantenedor único — ver `README.md`), sem citar clientes reais ou informação privada (ver `CONTRIBUTING.md`/README sobre isso).

## Passo 4 — nunca reescreva um ADR existente para mudar a decisão

Uma mudança de direção vira um **novo ADR** que referencia o anterior (ex. "Isto substitui `docs/adr/0003-...md`"). A única edição aceitável em um ADR antigo é atualizar sua linha de `Status` para apontar pro novo ADR que o substitui — o `Contexto`/`Decisão`/`Consequências` originais ficam intocados, como registro histórico.

## Passo 5 — depois de escrever

1. Verifique que o novo ADR está livre de avisos do markdownlint (`.markdownlint.json` do repo — rodar `npx markdownlint-cli2 "docs/adr/**/*.md"` ou checar via a extensão do VS Code). Erros comuns já vistos neste projeto: bloco de código sem linguagem (` ```text `/` ```bash `), URL solta sem colchetes, tabela com separador `|---|---|` em vez de `| --- | --- |`.
2. Se o ADR documentar algo que muda uma afirmação em `README.md` ou `CONTRIBUTING.md` (ex. uma nova decisão fixada), atualize esses arquivos também — não deixe-os divergentes do ADR mais recente.
3. Não commite/abra PR sozinho — devolva o arquivo criado para revisão, seguindo o fluxo normal de git descrito em `CONTRIBUTING.md` (branch próprio, commit em português no padrão Commitizen, PR).
