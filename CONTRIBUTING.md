# Contribuindo

Obrigado pelo interesse em contribuir com este template open source de e-commerce. Este documento descreve o processo esperado.

## Antes de abrir um PR

1. Leia o [`README.md`](README.md) para entender o que é o projeto, e os ADRs em [`docs/adr/`](docs/adr/) para as decisões de arquitetura já fixadas e seus porquês.
2. Leia a seção "Padrões de código" abaixo — todo código novo precisa seguir Clean Code, Clean Architecture e SOLID como baseline, não como aspiração (ver `docs/adr/0004-clean-architecture-solid-as-baseline.md`).
3. Para mudanças com impacto arquitetural (nova dependência estrutural, mudança de como camadas se relacionam, etc.), proponha ou já inclua um ADR em `docs/adr/` explicando o porquê — veja `docs/adr/0001-record-architecture-decisions.md`.
4. Abra uma issue descrevendo o problema/proposta antes de começar um trabalho grande, para alinhar escopo e abordagem.

## Reportando bugs

Abra uma issue com: passos para reproduzir, comportamento esperado vs. observado, e ambiente (versão de Ruby/Node, navegador, se relevante). Para vulnerabilidades de segurança, **não** abra uma issue pública — veja [`SECURITY.md`](SECURITY.md).

## Padrões de código

Este projeto segue **Clean Code**, **Clean Architecture** e **SOLID** como baseline obrigatório, não como aspiração (ver `docs/adr/0004-clean-architecture-solid-as-baseline.md`):

- **Regra de negócio não mora em controller nem em callback de ActiveRecord.** Controllers orquestram (recebem request, chamam um service/use case, respondem); regra de negócio vive em objetos de domínio/service objects testáveis isoladamente.
- **Isolamento nicho ↔ core.** Qualquer coisa específica de um negócio (textos, flags de quais páginas existem, tema visual, SEO) deve ser **configuração**, injetada no domínio core, nunca o inverso — isso inclui qualquer PR que acople o core a um caso de uso de nicho específico.
- **Dependências apontam para dentro.** Camadas de infraestrutura (banco, gateways de pagamento, envio de e-mail) implementam interfaces que o domínio define — o domínio não conhece detalhes de implementação externa.
- **Sem fat controllers, sem callback soup, sem God objects.** Classes pequenas, com uma responsabilidade clara (SRP). Prefira composição a herança profunda.
- **Nomes sempre completos e descritivos, nunca abreviados ou ambíguos.** Proibido nomear variável/parâmetro/método com letra solta ou abreviação (`e`, `a`, `t`, `tmp`, `obj`, `val`, `arr`, `str`...), mesmo em blocos curtos, lambdas ou loops. O nome precisa deixar óbvio o que a coisa é/faz (ex. `digital_product`, não `prod`/`dp`; `calculate_total_price`, não `calc_total`/`ct`).
- **Sem string/valor mágico espalhado pelo código.** Nada de comparar ou atribuir strings/números literais soltos (ex. `status == "pago"`, `role = "admin"`) em múltiplos lugares. Use enums (`enum` do ActiveRecord quando fizer sentido no domínio) ou constantes/módulos de constantes nomeados, definidos uma vez, referenciados em todo lugar.
- **Comentário só como documentação formal de API, nunca como muleta de nome ruim.** Se o código precisa de um comentário explicando "o quê" ou um "por quê" óbvio, o nome está errado — renomeie em vez de comentar. Comentários são aceitáveis como **YARD** (equivalente Ruby ao PHPDoc/JSDoc) documentando contrato público de classes/métodos, ou para explicar um "porquê" não óbvio (ex. um workaround, uma decisão não trivial).
- Backend Ruby: siga as regras do Rubocop configuradas no projeto (`bundle exec rubocop`).
- Frontend: TypeScript, componentes React pequenos e testáveis.
- **Nunca usar o tipo `any`.** Toda variável, parâmetro, retorno de função e prop de componente precisa de um tipo real. Se o tipo correto não for óbvio, pesquise (documentação oficial da lib, Context7) em vez de recorrer a `any` ou `as any` como atalho. `unknown` + narrowing é aceitável quando o tipo genuinamente não pode ser conhecido antecipadamente (ex. parsing de JSON externo) — `any` nunca é.
- **HTML sempre semântico.** Use o elemento certo pro que ele representa (`header`, `nav`, `main`, `section`, `article`, `footer`, `button`, `label`, etc.) em vez de `div`/`span` genérico quando existe elemento semântico apropriado — acessibilidade e SEO dependem disso, e SEO é uma feature explícita do painel admin deste projeto.
- **Em caso de dúvida sobre como uma biblioteca/framework/API funciona, consulte a documentação oficial atual antes de implementar** — não assuma pelo que "parece familiar" de outra versão ou outra lib.

## Testes

Todos os tipos de teste são esperados: unitário, integração, system/feature e, eventualmente, e2e. **Teste verde não é o critério de sucesso** — a asserção precisa de fato verificar o comportamento certo (edge cases incluídos), não só "passar". PRs com testes que não falhariam numa regressão real podem ser solicitados a melhorar a cobertura antes do merge.

- Backend: RSpec (unit + request specs) + Capybara/Cuprite (system specs).
- Frontend: Vitest + React Testing Library (componentes).
- E2e: **Playwright** (não Cypress — melhor suporte a TypeScript, multi-browser nativo e não compete com o Vitest como test runner). Entra quando houver fluxo de UI real para testar — não antes.
- Markdown: todo `.md` do repositório segue o `.markdownlint.json` da raiz.

PRs precisam incluir testes para o comportamento novo/alterado, e a suíte completa precisa passar:

```bash
bundle exec rspec                # testes backend
npm run test                     # testes frontend (Vitest)
npx playwright test              # testes e2e (quando existirem)
bundle exec rubocop              # lint Ruby
bundle exec brakeman             # análise de segurança
npx markdownlint-cli2 "**/*.md"  # lint de markdown
```

## Processo de PR

0. Antes do primeiro commit, ative os git hooks versionados do repositório: `git config core.hooksPath .githooks`.
1. Fork do repositório, **um branch por mudança** a partir de `main` — não misture várias mudanças não relacionadas no mesmo branch. Nome do branch segue um padrão fixo, ver "Padrão de nome de branch" abaixo.
2. Commits em português, no padrão **Commitizen/Conventional Commits** (`tipo: descrição` — tipo em inglês por convenção da ferramenta: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`; descrição/corpo em português), bem detalhados sobre tudo que foi feito e por quê — nunca mensagens genéricas como "ajustes" ou "fix".
3. **Sempre abra um PR** (nunca commit direto na `main`), descrevendo o que mudou e por quê, linkando a issue relacionada se houver.
4. **PRs pequenos e focados** — um PR resolve uma coisa. Se a mudança crescer e passar a resolver várias coisas não relacionadas, quebre em PRs menores.
5. **Revise seu próprio diff antes de abrir o PR** — releia as mudanças, rode lint/testes relevantes localmente, confira que nada ficou pela metade. Não abra PR só na esperança de que o CI pegue os problemas.
6. CI (lint, segurança, testes) precisa passar antes do review.
7. Se o PR formalizar uma decisão de arquitetura/produto nova (não só implementação de algo já decidido), inclua o ADR correspondente no mesmo PR — ver `docs/adr/0001-record-architecture-decisions.md` e a skill `create-adr`.

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

- **Hook local** (`.githooks/commit-msg`): rejeita o commit antes mesmo de ser criado. Ative com `git config core.hooksPath .githooks` (passo 0 acima).
- **CI** (`.github/workflows/no-ai-attribution.yml`): verifica commits e o corpo/título do PR, como segunda camada de proteção caso o hook local seja ignorado ou não esteja ativado.

**Isso não significa que IA não possa ser usada no desenvolvimento.** Pode, e este projeto é construído com auxílio de IA — a única exigência é que ela nunca apareça como colaboradora/co-autora no repositório (questão de organização/estética, não uma restrição sobre a ferramenta usada). Código produzido com ou sem auxílio de IA passa pelos mesmos padrões deste documento, sem exceção: Clean Code/Clean Architecture/SOLID, nomes descritivos, sem string mágica, HTML semântico, testes de verdade, lint e segurança limpos.

## Código de conduta

Este projeto segue o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
