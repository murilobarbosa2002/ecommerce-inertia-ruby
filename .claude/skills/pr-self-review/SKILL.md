---
name: pr-self-review
description: Use esta skill antes de abrir ou atualizar qualquer PR neste projeto, como a etapa de "revise seu próprio diff" exigida em CONTRIBUTING.md — mesmo sem o mantenedor pedir explicitamente. Percorre um checklist concreto contra os padrões de código, segurança e teste já fixados no projeto, em vez de revisão genérica.
---

# Autorrevisão de PR neste projeto (skill: pr-self-review)

## Quando usar

Sempre, antes de rodar `gh pr create` ou de dar uma mudança como pronta pra reportar — é a formalização do passo "revise seu próprio diff antes de abrir o PR" de `CONTRIBUTING.md`, seção "Processo de PR". Não precisa o mantenedor pedir; é parte do fluxo obrigatório já fixado em `CLAUDE.md` (planejar → implementar → lint/teste → **revisar** → reportar).

Esta skill não substitui rodar lint/teste/build de verdade — ela garante que, além de "passou", o diff também segue as convenções do projeto que lint/teste não pegam sozinhos (arquitetura, nomes, segurança, se o teste de fato cobre a mudança).

## Checklist

Releia o diff completo (`git diff`/`git diff --cached`) contra cada item. Quando um item apontar pra uma regra específica, leia a seção referenciada em vez de confiar em memória — regras podem ter mudado desde a última revisão.

1. **Arquitetura** (`CONTRIBUTING.md`, "Padrões de código"): regra de negócio não está em controller/callback de ActiveRecord; nada de nicho específico acoplado ao core; dependência aponta pra dentro (domínio não conhece infraestrutura externa); sem fat controller/God object.
2. **Nomes e strings mágicas**: nenhum nome abreviado/ambíguo; nenhuma string/número literal comparado/atribuído em mais de um lugar sem ser enum/constante nomeada.
3. **Comentários**: só existem onde o "porquê" não é óbvio (workaround, decisão não trivial) ou como YARD de API pública — nenhum comentário existe só pra compensar nome ruim.
4. **TypeScript**: zero `any`/`as any`; `unknown` + narrowing só quando o tipo genuinamente não é previsível.
5. **HTML semântico**: elemento certo pro papel (`header`/`nav`/`main`/`button`/`label`/etc.), não `div`/`span` genérico onde existe tag semântica.
6. **Segurança** (`CONTRIBUTING.md`, "Segurança", guiado por `docs/adr/0010`): validação de servidor é a autoridade (não só Zod no cliente); dado em fronteira de confiança validado em runtime com tipo inferido do schema; query parametrizada; strong parameters explícito (nunca `permit!`); autorização checa o recurso específico, não só autenticação; CSRF/escaping não foi desligado sem ADR; dado sensível criptografado/hasheado, nunca texto puro; segredo nunca commitado; `config.filter_parameters` atualizado se um campo sensível novo apareceu.
7. **Teste é regressão de verdade** (`CONTRIBUTING.md`, "Testes" — regra explícita: "PRs com testes que não falhariam numa regressão real podem ser solicitados a melhorar a cobertura"): todo comportamento novo/alterado tem teste; se o teste passaria mesmo com o bug de volta, não conta — considere quebrar a implementação de propósito e confirmar que o teste falha, antes de confiar nele.
8. **Convenção de teste frontend**: nenhum `*.test.tsx` dentro de `app/frontend/pages/` (vaza pro build de produção — bug real já documentado em `docs/environment-setup.md`).
9. **Verificações reais rodadas e limpas**, não só assumidas: lint (`pnpm lint`/`bundle exec rubocop`), tipos (`pnpm check`), testes (`bundle exec rspec`/`pnpm test`), segurança (`bundle exec brakeman`/`bundle exec bundler-audit`), markdown (`pnpm dlx markdownlint-cli2`) quando aplicável à mudança.
10. **Nada pela metade**: nenhum arquivo de teste/debug temporário sobrou no diff; nenhum `console.log`/`binding.pry`/comentário de TODO esquecido sem contexto.
11. **Git/PR**: nome de branch no padrão `<tipo>/<descricao-em-ingles>`; commit em português, tipo em inglês (Commitizen), mensagem detalhada o suficiente pra revisão real (não genérica); zero linha de atribuição de IA (o hook/CI já bloqueiam, mas vale confirmar antes de depender só deles); se a mudança formaliza uma decisão de arquitetura, o ADR correspondente está no mesmo PR.

## Depois do checklist

Só então: abrir/atualizar o PR, com a descrição detalhando tudo que foi feito e o porquê (ver `CONTRIBUTING.md`, item 3 do "Processo de PR") — não um resumo genérico.
