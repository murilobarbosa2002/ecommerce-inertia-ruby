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
- **Namespace de controller/service não pode ter o mesmo nome de uma classe já existente.** Ruby não permite reabrir uma classe (`class Admin < ApplicationRecord`) como módulo de namespace (`module Admin; class SessionsController; end; end` levanta `TypeError: Admin is not a module`) — erro só aparece rodando o código, não lendo a definição isoladamente. Antes de nomear uma pasta de controller/service/concern igual a um model existente, confirme que o nome não colide; se colidir, use `namespace :rota, module: "nome_alternativo"` no `routes.rb` pra manter a URL/route helper como estavam, só trocando a classe Ruby (ex. `AdminPanel::` em vez de `Admin::` pros controllers do painel, já que o model `Admin` ocupa esse nome).
- **Sem string/valor mágico espalhado pelo código.** Nada de comparar ou atribuir strings/números literais soltos (ex. `status == "pago"`, `role = "admin"`) em múltiplos lugares. Use enums (`enum` do ActiveRecord quando fizer sentido no domínio) ou constantes/módulos de constantes nomeados, definidos uma vez, referenciados em todo lugar.
  - **Exceção deliberada: valor esperado de uma mensagem traduzida (I18n), em teste que existe justamente pra verificar que a tradução está correta.** Nesse caso, a string literal (ex. `expect(flash[:alert]).to eq("E-mail ou senha inválidos")`) *é* a asserção — trocar por `I18n.t("a.mesma.chave")` faz o teste comparar a chave contra ela mesma (`I18n.t(chave) == I18n.t(chave)`), sempre verdadeiro mesmo com a tradução quebrada/faltando, e o teste some de ter valor nenhum. Confirmado quebrando a tradução de propósito: a versão com `I18n.t(...)` continuou verde; a versão com string literal foi pro vermelho, como devia. Regra então é: dado de teste arbitrário (senha, nome, etc.) repetido em vários lugares vira constante; texto esperado de uma tradução sob teste fica literal.
- **Comentário só como documentação formal de API, nunca como muleta de nome ruim.** Se o código precisa de um comentário explicando "o quê" ou um "por quê" óbvio, o nome está errado — renomeie em vez de comentar. Comentários são aceitáveis como **YARD** (equivalente Ruby ao PHPDoc/JSDoc) documentando contrato público de classes/métodos, ou para explicar um "porquê" não óbvio (ex. um workaround, uma decisão não trivial).
- **Pendência marcada no código usa uma das três tags rastreadas pela extensão `gruntfuggly.todo-tree`** (configuração em `.vscode/settings.json`, instalação documentada em `docs/environment-setup.md`): `TODO:` pra trabalho futuro genérico, sem bloqueio (ex. uma PR planejada que ainda não chegou); `FIXME:` pra lacuna/gap conhecido que precisa de correção (não é só "fazer depois", é "tem algo incompleto/errado aqui"); `PENDING-FRONTEND:` especificamente pra algo que só é resolvível quando a página/tela correspondente do painel existir (backend pronto, mas sem como verificar/usar de ponta a ponta ainda). Toda tag inclui uma frase curta explicando o motivo e, quando fizer sentido, uma referência ao ADR/issue relevante — nunca só a palavra sozinha.
- Backend Ruby: siga as regras do Rubocop configuradas no projeto (`bundle exec rubocop`).
- Frontend: TypeScript, componentes React pequenos e testáveis. Siga ESLint (`pnpm lint`) e Prettier (`pnpm format:check`) configurados no projeto — `eslint.config.mjs` inclui regras de tipagem estrita (typescript-eslint `strictTypeChecked`), React, acessibilidade (`jsx-a11y` strict) e Tailwind; Prettier (com `prettier-plugin-tailwindcss`) é quem formata/ordena classes, não o ESLint.
- **Formulário sempre com Zod + `zodResolver` + React Hook Form**, nunca validação manual ad-hoc. **Componente de UI com comportamento (modal, select, checkbox, etc.) sempre parte de um primitivo do pacote `radix-ui`**, estilizado por este projeto com Tailwind — nunca reimplementado do zero. **Variante de estilo usa `tv()` do `tailwind-variants`**, não concatenação manual de classe condicional. Racional completo em `docs/adr/0012-form-validation-and-ui-primitives-stack.md`.
- **Nunca usar o tipo `any`.** Toda variável, parâmetro, retorno de função e prop de componente precisa de um tipo real. Se o tipo correto não for óbvio, pesquise (documentação oficial da lib, Context7) em vez de recorrer a `any` ou `as any` como atalho. `unknown` + narrowing é aceitável quando o tipo genuinamente não pode ser conhecido antecipadamente (ex. parsing de JSON externo) — `any` nunca é.
- **HTML sempre semântico.** Use o elemento certo pro que ele representa (`header`, `nav`, `main`, `section`, `article`, `footer`, `button`, `label`, etc.) em vez de `div`/`span` genérico quando existe elemento semântico apropriado — acessibilidade e SEO dependem disso, e SEO é uma feature explícita do painel admin deste projeto.
- **Em caso de dúvida sobre como uma biblioteca/framework/API funciona, consulte a documentação oficial atual antes de implementar** — não assuma pelo que "parece familiar" de outra versão ou outra lib.
- **Todo texto novo visível a humano passa por chave de I18n (`I18n.t`/`t`), nunca string literal direto no código** — formulário, e-mail, mensagem de erro, página, prompt de CLI. Única exceção: texto de debug/log interno nunca visto por humano fora de desenvolvimento. Locale padrão é `pt-BR` (`docs/adr/0014-i18n-default-locale-and-content-separation.md`). Conteúdo real de produto (model, formulário, e-mail, página) vai em `config/locales/pt-BR.yml`; texto de ferramenta interna de linha de comando (rake task) vai em `config/locales/cli.pt-BR.yml` — nunca misturados no mesmo arquivo.
  - **A gem `rails-i18n` não cobre 100% das mensagens que o Rails gera** — bug real encontrado: `has_secure_password` usa a chave `password_too_long` (fora do namespace `activerecord`, para a senha de até 72 bytes aceita pelo bcrypt) e `rails-i18n` não traduz essa chave específica pra `pt-BR`, aparecendo como `"Translation missing"` pro usuário. Toda vez que um model novo usar `has_secure_password` (ou qualquer feature do Rails que gere mensagem de validação), **teste de verdade a mensagem de erro renderizada** (não assuma que `rails-i18n` cobre) e adicione a chave em `config/locales/pt-BR.yml` se faltar (`errors.messages.<chave>` pra mensagem genérica, `activerecord.attributes.<model>.<atributo>` pro nome do campo).
- **Coluna `:string` do PostgreSQL não tem limite de tamanho por padrão** (diferente de `varchar` do MySQL) — sem `validates ..., length: { maximum: N }` explícito no model, o campo aceita qualquer tamanho, inclusive payloads multi-megabyte (vetor de esgotamento de recurso). Todo atributo de input de usuário (e-mail, nome, etc.) precisa de um limite de tamanho explícito e com motivo documentado (ex. RFC 5321 pra e-mail: 254 caracteres) — bug real encontrado no model `Admin`, corrigido depois da feature já estar em uso.

## Segurança

Segurança é baseline obrigatório, não aspiração, guiado pelo [OWASP Top 10](https://owasp.org/Top10/) (ver `docs/adr/0010-security-practices-as-baseline.md` para o racional completo):

- **Validação sempre no servidor.** Validação de formulário no frontend (Zod) é UX — a autoridade final é o backend (validações do ActiveRecord + strong parameters). Nunca confie só na validação do cliente.
- **Dado que cruza fronteira de confiança é validado em runtime, não só tipado em compile-time.** Resposta de API externa, payload de formulário, webhook — valide com Zod e infira o tipo TypeScript do schema (`z.infer`), nunca deixe tipo e validação divergirem.
- **Query sempre parametrizada** — nunca interpolar valor vindo de usuário em SQL cru; use os métodos do ActiveRecord.
- **Strong parameters sempre explícito** — nunca `permit!`; liste os campos esperados.
- **Autorização não é autenticação.** Toda ação que acessa um recurso verifica que o usuário atual tem permissão sobre *aquele* recurso específico — nunca confie em `params[:id]` sozinho.
- **CSRF e escaping automático (Rails/React) nunca são desligados** sem um ADR justificando o porquê.
- **Dado sensível é criptografado em repouso** — `encrypts` (Active Record Encryption nativo do Rails) para PII sensível, não só senha.
- **Senha nunca em texto puro nem criptografia reversível** — sempre hash (`has_secure_password`/bcrypt).
- **Dado de pagamento nunca é armazenado pelo nosso banco** — sempre via token de um gateway de pagamento (nunca número de cartão, CVV, etc. tocando nosso banco).
- **Segredo nunca commitado** — Rails credentials (`master.key` fora do git) ou variável de ambiente, nunca hardcoded.
- **Log nunca expõe dado sensível** — estenda `config.filter_parameters` sempre que um novo campo sensível entrar no domínio (já cobre senha/e-mail/token/etc. por padrão).

`brakeman` e `bundler-audit` (CI) pegam sintomas automaticamente (SQLi, XSS, dependência vulnerável) — essas regras evitam a causa, não substituem a ferramenta.

## Testes

Todos os tipos de teste são esperados: unitário, integração, system/feature e, eventualmente, e2e. **Teste verde não é o critério de sucesso** — a asserção precisa de fato verificar o comportamento certo (edge cases incluídos), não só "passar". PRs com testes que não falhariam numa regressão real podem ser solicitados a melhorar a cobertura antes do merge.

- Backend: RSpec (unit + request specs) + Capybara/Cuprite (system specs, Chromium headless real via CDP). **Ao testar uma rake task que chama `exit`/`abort`, qualquer `it` que não espere isso explicitamente (`expect { }.to raise_error(...)`) derruba o processo inteiro do RSpec, não só aquele exemplo** — `SystemExit`/`Exception` não é resgatado pelo runner por padrão, só `StandardError` (bug real já encontrado neste projeto). Specs `type: :task` já stubam `Kernel#exit` pra levantar `RakeTaskExited` (`spec/support/rake.rb`) em vez do `SystemExit` real — qualquer rake task nova que chame `exit` já está coberta por esse stub, não precisa reinventar.
- Frontend: Vitest + React Testing Library (componentes). **Nunca coloque `*.test.tsx` dentro de `app/frontend/pages/`** — o plugin `@inertiajs/vite` trata qualquer `.tsx` ali como página e o teste vaza pro build de produção (bug real já encontrado e corrigido neste projeto). Testes de página ficam em `app/frontend/test/pages/<mesmo-caminho>/`, importando o componente via alias `@/pages/...`.
- E2e: **Playwright** (não Cypress — melhor suporte a TypeScript, multi-browser nativo e não compete com o Vitest como test runner). Entra quando houver fluxo de UI real para testar — não antes.
- Markdown: todo `.md` do repositório segue o `.markdownlint.json` da raiz.

PRs precisam incluir testes para o comportamento novo/alterado, e a suíte completa precisa passar:

```bash
bundle exec rspec                # testes backend
pnpm test                        # testes frontend (Vitest)
pnpm dlx playwright test         # testes e2e (quando existirem)
pnpm lint                        # lint JS/TS (ESLint)
pnpm format:check                # formatação JS/TS (Prettier)
bundle exec rubocop              # lint Ruby
bundle exec brakeman             # análise de segurança
pnpm dlx markdownlint-cli2 "**/*.md"  # lint de markdown
```

## Processo de PR

0. `pnpm install` já ativa os git hooks do projeto (Husky — ver seção "Git hooks" abaixo); nenhum passo manual.
1. Fork do repositório, **um branch por mudança** a partir de `main` — não misture várias mudanças não relacionadas no mesmo branch. Nome do branch segue um padrão fixo, ver "Padrão de nome de branch" abaixo.
2. Commits em português, no padrão **Commitizen/Conventional Commits** (`tipo: descrição` — tipo em inglês por convenção da ferramenta: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`; descrição/corpo em português), bem detalhados sobre tudo que foi feito e por quê — nunca mensagens genéricas como "ajustes" ou "fix".
3. **Sempre abra um PR** (nunca commit direto na `main`), com descrição **detalhada o suficiente pra uma revisão de código de verdade** — não um resumo genérico. Liste os arquivos relevantes tocados e o porquê, qualquer decisão tomada durante a implementação que não estava no escopo original (ex. um bug encontrado e corrigido no caminho), e o resultado das verificações locais (lint/teste/build). Linke a issue relacionada se houver.
4. **PRs pequenos e focados** — um PR resolve uma coisa. Se a mudança crescer e passar a resolver várias coisas não relacionadas, quebre em PRs menores.
5. **Revise seu próprio diff antes de abrir o PR** — releia as mudanças, rode lint/testes relevantes localmente, confira que nada ficou pela metade. Não abra PR só na esperança de que o CI pegue os problemas.
6. CI (lint, segurança, testes) precisa passar antes do review.
7. Se o PR formalizar uma decisão de arquitetura/produto nova (não só implementação de algo já decidido), inclua o ADR correspondente no mesmo PR — ver `docs/adr/0001-record-architecture-decisions.md` e a skill `create-adr`.

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
