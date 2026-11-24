# Bugs: acessibilidade

Bugs relacionados a acessibilidade (WCAG) não pegos pelo lint estático (`eslint-plugin-jsx-a11y`). Ver `docs/bugs/README.md` para o índice geral e o template de entrada, e `docs/adr/0028-accessibility-as-baseline.md` para o porquê desta categoria e as regras adotadas.

## `<html>` sem atributo `lang`

- **Data:** 2026-11-09
- **Severidade:** alta
- **PR:** #56

### O que aconteceu

`app/views/layouts/application.html.erb` (layout aplicado em toda página do projeto) nunca declarou o atributo `lang` na tag `<html>`.

### Causa raiz

O layout foi criado a partir do scaffold padrão do Rails/Vite e nunca recebeu esse atributo depois — nenhuma ferramenta de lint do projeto (`eslint-plugin-jsx-a11y`, que atua só sobre JSX, não sobre o `.erb` do layout) cobre isso.

### Como foi encontrado

Revisão deliberada de acessibilidade do projeto, verificando contra WCAG 3.1.1 (Language of Page) — o requisito mais básico de acessibilidade, normalmente o primeiro item de qualquer auditoria.

### Impacto

Leitor de tela não tem como saber em qual idioma pronunciar o conteúdo da página sem esse atributo — pode usar o idioma padrão do sistema do usuário, errado na maioria dos casos (projeto é pt-BR). Afeta literalmente toda página do admin.

### Correção

`<html lang="<%= I18n.locale %>">` — lê de `I18n.locale` (nunca hardcoded), consistente com `I18n.default_locale = :"pt-BR"` (`docs/adr/0014`).

### Verificação

Teste novo em `spec/requests/admin/layout_spec.rb`, verificando que o HTML renderizado contém `<html lang="pt-BR">`. Confirmado vermelho removendo o atributo de propósito, verde com ele restaurado.

## `Dialog` não associava a descrição via `aria-describedby`

- **Data:** 2026-11-09
- **Severidade:** média
- **PR:** #56

### O que aconteceu

`components/shared/dialog/Dialog.tsx` renderizava `title` via `RadixDialog.Title` (correto), mas o texto descritivo do único consumidor (`PanelLayout`, aviso obrigatório de 2FA) era passado como `children` — um `<p>` solto, não `RadixDialog.Description`.

### Causa raiz

Sem `RadixDialog.Description`, o Radix não tem como montar `aria-describedby` apontando pro texto certo — a API do Radix só monta essa associação quando o elemento vem do primitivo dedicado, não de qualquer `<p>` dentro do conteúdo.

### Como foi encontrado

Revisão deliberada de acessibilidade, lendo o código do `Dialog` e comparando contra a documentação do Radix sobre `Description`/`aria-describedby`.

### Impacto

Quem usa leitor de tela, ao ter esse diálogo (não-dispensável, bloqueia o resto do painel até ser resolvido) aberto, teria o título anunciado mas não a descrição do porquê o diálogo apareceu nem o que fazer — teria que navegar manualmente pelo conteúdo pra descobrir, perdendo o contexto que o `aria-describedby` daria de imediato.

### Correção

`Dialog` ganha uma prop `description` opcional, renderizada via `RadixDialog.Description` (que monta `aria-describedby` automaticamente). `PanelLayout` passa o texto descritivo por essa prop em vez de como `<p>` solto em `children`.

### Verificação

Teste novo em `Dialog.test.tsx` usando o matcher `toHaveAccessibleDescription` (resolve a cadeia real de `aria-describedby`, não só presença de texto na tela). Confirmado vermelho voltando pra um `<p>` solto de propósito, verde com `RadixDialog.Description` restaurado.

## Borda de campo inválido com contraste insuficiente (WCAG 1.4.11)

- **Data:** 2026-11-09
- **Severidade:** média
- **PR:** #56

### O que aconteceu

`Input.variants.ts` usava `border-red-300` (claro) e `dark:border-red-700` (escuro) pro estado `invalid` em repouso (não focado) — a mensagem de erro (`FieldError`, texto vermelho) tinha contraste adequado, mas a borda em si (o indicador visual de "este campo tem problema") não.

### Causa raiz

Contraste nunca foi calculado quando essas cores foram escolhidas — `red-300`/`red-700` foram escolhidas visualmente ("parece vermelho suave o suficiente"), sem verificar a razão de contraste real contra o fundo do campo.

### Como foi encontrado

Cálculo real via fórmula de luminância relativa do WCAG (`(L1+0.05)/(L2+0.05)`, aplicada às cores sRGB exatas do Tailwind), não estimativa visual: `border-red-300` contra branco deu 1.90:1, `dark:border-red-700` contra `gray-800` (fundo do input no dark mode) deu 2.27:1 — os dois abaixo do mínimo de 3:1 que WCAG 1.4.11 (Non-text Contrast) exige pra um indicador de estado de componente de UI.

### Impacto

Admin com baixa visão pode não perceber visualmente que um campo está marcado como inválido — a borda quase não contrasta com o fundo do campo, embora o texto de erro abaixo (que tem contraste adequado) ainda comunique o problema. Prejudica especificamente quem depende do indicador visual direto no campo (ex. ao escanear um formulário longo rapidamente).

### Correção

`border-red-300`/`dark:border-red-700` (repouso) trocados por `border-red-500`/`dark:border-red-500` — mesmo tom já usado no estado de foco (`focus:border-red-500`), agora consistente nos dois estados e passando 3:1 nos dois modos (3.76:1 claro, 3.90:1 escuro, confirmado por cálculo).

### Verificação

`Input.test.tsx` e `FormField.test.tsx` atualizados pra verificar `border-red-500` (não mais `border-red-300`). Confirmado vermelho restaurando as cores antigas de propósito (a asserção `not.toHaveClass("border-red-300")` falha), verde com a correção restaurada.

## Opções do gerador de senha sem agrupamento semântico

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #56

### O que aconteceu

`PasswordGenerator` (3 checkboxes + campo de quantidade de caracteres) renderizava os 4 controles numa `<div>` simples, sem nenhum agrupamento semântico indicando que são opções relacionadas de uma mesma função.

### Causa raiz

O mesmo problema já tinha sido corrigido nos checkboxes de permissão (`Admin/Roles`, `fieldset`/`legend`) durante a PR de papéis, mas a lição não foi generalizada pro resto do projeto na hora — `PasswordGenerator` já existia antes disso e não foi revisitado.

### Como foi encontrado

Revisão deliberada de acessibilidade, comparando todo grupo de controle relacionado no projeto contra o padrão já estabelecido pros checkboxes de permissão.

### Impacto

Quem usa leitor de tela, navegando pelos controles de formulário um a um, não tem como saber que os 3 checkboxes e o campo de tamanho pertencem à mesma função ("opções de geração de senha") — cada um é anunciado isoladamente, sem contexto do grupo.

### Correção

Opções envolvidas num `fieldset` com `legend` ("Opções de geração de senha"), mesmo padrão já usado nos checkboxes de permissão.

### Verificação

Teste novo em `PasswordGenerator.test.tsx` verificando `getByRole("group", { name: "Opções de geração de senha" })` contém os checkboxes. Confirmado vermelho revertendo o `fieldset` pra uma `div` de propósito, verde com ele restaurado.

## `<label for>` apontando pro gatilho de um combobox sobrescrevia o nome acessível dele

- **Data:** 2026-11-22
- **Severidade:** média
- **PR:** #72

### O que aconteceu

`MultiSelect` (combobox fechado por padrão, usado no filtro de tipo de evento do dashboard) tinha um `<Label htmlFor="activity-type-search">Tipo de evento</Label>` logo acima do botão-gatilho (`<button id="activity-type-search">`, mostrando o resumo escolhido, ex. "3 selecionados"). Um teste automatizado escrito pra verificar o texto do gatilho (`getByRole("button", { name: "Todos os tipos" })`) falhava — o nome acessível do botão não era o resumo, era o texto do label ("Tipo de evento").

### Causa raiz

A associação `<label for="x">` sobrescreve o nome acessível do elemento `x` pelo texto do próprio `<label>`, segundo o algoritmo de cálculo de nome acessível (accname) — isso vale mesmo quando `x` já tem conteúdo visível próprio (o botão mostrando "3 selecionados"). Essa regra existe pensando em controles nativos de formulário simples (`<input>`, onde o conteúdo visível do campo não é um "nome" por si, só um valor) — um botão com texto próprio significativo não se beneficia dela, só perde o próprio nome.

### Como foi encontrado

Teste de regressão escrito pro `MultiSelect` esperava o nome acessível do gatilho ser o resumo escolhido; falhou com o nome acessível sendo "Tipo de evento" em vez disso, antes de qualquer correção.

### Impacto

Alguém usando leitor de tela ouviria só "Tipo de evento, botão" ao focar o gatilho — nunca "Todos os tipos" ou "3 selecionados" — perdendo a única informação que de fato muda (o que está selecionado agora), tendo que abrir o combobox pra descobrir.

### Correção

O texto visível acima do gatilho deixou de ser um `<label for>` de verdade — vira um `<p>` sem associação nenhuma, e o nome acessível completo (rótulo do campo + resumo escolhido) entra via `aria-label` no próprio botão-gatilho.

### Verificação

Teste de `MultiSelect.test.tsx` (`getByRole("button", { name: "Categoria: 1 selecionadas" })`) confirmado vermelho com `<Label htmlFor>` (nome acessível virava só "Categoria"), verde depois da correção.

## Animações de entrada do dashboard ignoravam `prefers-reduced-motion`

- **Data:** 2026-11-23
- **Severidade:** média
- **PR:** #76

### O que aconteceu

As animações de entrada introduzidas no dashboard (feed de atividade) e de abrir/fechar em `Popover`/`Dialog` usavam `motion.div`/`motion.ol` direto, sem checar a preferência de movimento reduzido do sistema operacional — animação de deslocamento e escala rodava sempre, mesmo pra quem ativou essa preferência de acessibilidade no SO.

### Causa raiz

A implementação original (PR #75) só cobriu a exibição visual da animação, sem considerar `prefers-reduced-motion` — gap que passou pela revisão por não ter teste cobrindo esse cenário e por `Reveal` (único componente de animação existente até então) também não ter esse guard.

### Como foi encontrado

Levantado durante o planejamento das próximas fases do painel (antes de iniciar a Fase B), ao revisar lacunas de acessibilidade pendentes.

### Impacto

Quem configurou o sistema operacional pra reduzir movimento continuava recebendo deslocamento e escala nas animações do painel — a preferência de acessibilidade era ignorada, podendo causar desconforto (ex. sensibilidade vestibular).

### Correção

`Reveal` e o novo `ScaleFade` (ambos em `components/motion/`) passaram a usar `useReducedMotion()` do Motion: com a preferência ativa, a duração zera e o deslocamento/escala inicial é descartado, restando só variação de opacidade.

### Verificação

Suíte de testes de `Reveal.test.tsx`/`ScaleFade.test.tsx` cobre renderização e forwarding de props; o comportamento de `as`/`scale` foi confirmado vermelho quebrando a implementação de propósito (`motion[as]` → `motion["div"]` fixo) e verde depois de restaurado.
