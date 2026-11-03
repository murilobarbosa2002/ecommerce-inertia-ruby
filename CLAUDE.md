# CLAUDE.md

Instruções para agentes de IA (Claude Code e similares) atuando neste repositório. **Este arquivo não é documentação do projeto para humanos** — isso vive em `README.md`, `CONTRIBUTING.md` e `docs/adr/`. Leia esses arquivos para contexto completo antes de agir; não há conteúdo duplicado aqui de propósito, para não haver duas fontes de verdade divergentes.

## Regras de comportamento

- **Nunca fazer mudanças não triviais sem planejar e explicar antes.** Apresente o plano (o quê, por quê, trade-offs envolvidos) e só implemente depois de alinhado com o mantenedor.
- **Nunca decidir sozinho.** Decisões de produto, arquitetura ou escopo são do mantenedor. Havendo mais de um caminho razoável, pergunte e explique as opções em vez de escolher por conta própria.
- **Siga o mesmo fluxo de git descrito em `CONTRIBUTING.md`** — branch por mudança, commit em português no padrão Commitizen, sempre PR, nunca commit direto na `main`.
- **Antes de implementar qualquer mudança não trivial, crie a branch correspondente** seguindo o padrão `<tipo>/<descricao-curta-em-ingles>` (`CONTRIBUTING.md`, seção "Padrão de nome de branch") — nunca implemente direto na `main`. A criação da branch é automática/esperada, não algo que precisa ser pedido toda vez; o que precisa de alinhamento com o mantenedor é o conteúdo da mudança, não o ato de criar a branch.
- **Quando uma decisão de arquitetura/produto for tomada** (confirmada pelo mantenedor, não inventada por você), crie o ADR correspondente usando a skill `create-adr` como parte do mesmo trabalho — não deixe decisão sem registro.
- **Nomes de pasta e de arquivo sempre em inglês** — ADRs, skills (`.claude/skills/<nome>/`), agentes (`.claude/agents/<nome>.md`) e documentos em `docs/` seguem essa regra, mesmo com o conteúdo em português. Só o conteúdo é em português; nome de pasta/arquivo nunca.
- **Nunca, em nenhuma hipótese, incluir qualquer atribuição de autoria da Claude/Anthropic** (`Co-Authored-By: Claude`, "Generated with Claude Code", e-mail `noreply@anthropic.com`, ou qualquer menção equivalente) em commit, mensagem de PR, código ou qualquer outro artefato deste repositório. Essa regra é bloqueada tecnicamente por hook local (`.githooks/commit-msg`) e por check no CI (`.github/workflows/no-ai-attribution.yml`) — ainda assim, nunca tente contornar esses bloqueios.
- **Em caso de dúvida sobre uso de biblioteca, framework ou API** (gems Ruby, Inertia Rails, React, etc.), consulte a documentação atual via **Context7 (MCP)** antes de implementar, em vez de confiar só em conhecimento prévio — frameworks mudam rápido e a resposta "lembrada" pode estar desatualizada.
- **Ao delegar trabalho a subagentes, sempre inclua no prompt a instrução explícita de ler `README.md`, `CONTRIBUTING.md` e os ADRs relevantes em `docs/adr/` antes de agir.** Um subagente novo não herda este arquivo sendo lido nem o contexto desta conversa — não assuma que ele vai descobrir as convenções do projeto sozinho.
- **Fluxo obrigatório pra qualquer mudança não trivial: planejar → implementar → rodar lint/testes relevantes → revisar o resultado (diff + saída do lint/teste) → só então reportar como concluído.** Se lint/teste falhar ou o diff revelar algo pela metade/inconsistente, corrija e repita a verificação antes de seguir — não reportar "feito" com essa checagem pendente.
- **O relato final de qualquer mudança (mensagem de commit, descrição de PR, resumo pro mantenedor) precisa detalhar TUDO que foi feito, não um resumo genérico.** Isso inclui: todo arquivo relevante tocado e o porquê, qualquer decisão tomada durante a implementação que não estava no pedido original (ex. um bug real encontrado e corrigido no caminho), e o resultado das verificações rodadas (lint/teste/build). O objetivo é o mantenedor conseguir fazer uma revisão de código de verdade a partir do relato, sem precisar reconstruir sozinho o que foi feito.

## Onde encontrar o quê

- O que é o projeto, escopo, stack, decisões fixadas, como rodar: `README.md`.
- Processo de contribuição, padrões de código (Clean Code/Clean Architecture/SOLID, segurança/OWASP), convenção de testes: `CONTRIBUTING.md`.
- Decisões de arquitetura e o porquê de cada uma: `docs/adr/`.
- Guia de fork/adaptação para outro negócio: `docs/adapting-to-a-new-niche.md`.
- Runbook de como o ambiente desta máquina foi configurado (o que já está feito, o que falta): `docs/environment-setup.md`.
- Código de conduta: `CODE_OF_CONDUCT.md`. Como reportar vulnerabilidade: `SECURITY.md`.

## Nota operacional desta sessão/ambiente

O desenvolvimento acontece via **VS Code no Windows conectado a este WSL (Ubuntu) pela extensão Remote-WSL**. Toda execução real — Ruby, Node, Postgres, test runners — roda dentro do WSL. Ao configurar ferramentas de teste/debug, validar também que funcionam através do Remote-WSL (test explorers de extensões), não só via CLI no terminal.
