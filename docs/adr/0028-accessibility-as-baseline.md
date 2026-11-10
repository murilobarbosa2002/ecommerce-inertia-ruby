# 0028 - Acessibilidade como baseline obrigatório

## Status

Aceito

## Contexto

`eslint-plugin-jsx-a11y` (preset `strict`) já está configurado desde o início do projeto (`eslint.config.mjs`, `CONTRIBUTING.md`) e roda em todo `pnpm lint` — cobre uma categoria real de defeito (label sem associação, `aria-*` inválido, elemento interativo sem suporte a teclado, atributo incompatível com a `role`), e vinha passando limpo. Mas lint estático de JSX não é uma auditoria de acessibilidade completa: não calcula contraste de cor de verdade, não verifica se conteúdo dinâmico (erro de validação, aviso) é de fato anunciado por leitor de tela, não verifica agrupamento semântico de controles relacionados, e não verifica atributo de documento (`lang`).

Revisão deliberada (mesmo racional já aplicado a outras categorias — segurança em `docs/adr/0010`, arquitetura em `docs/adr/0004`) encontrou quatro gaps reais, nenhum pego pelo lint estático porque nenhum é sintaticamente "errado", só semanticamente incompleto:

1. `<html>` sem atributo `lang` — requisito mais básico de acessibilidade (WCAG 3.1.1), afeta toda página.
2. `Dialog` (`components/shared/dialog/`) não usava `RadixDialog.Description` pro texto descritivo — o Radix não tinha como montar `aria-describedby`, então o diálogo (incluindo o aviso obrigatório de 2FA, `PanelLayout`) não anunciava a descrição junto do título pra quem usa leitor de tela.
3. `border-red-300`/`dark:border-red-700` (estado inválido do `Input`) tinham contraste real de 1.90:1/2.27:1 contra o fundo do campo — abaixo do mínimo de 3:1 que WCAG 1.4.11 exige pra um indicador de estado de UI (calculado via fórmula de luminância relativa do WCAG, não estimado).
4. Opções do `PasswordGenerator` (3 checkboxes + campo de tamanho) soltas sem agrupamento semântico — mesma categoria de problema já corrigido nos checkboxes de permissão (`Admin/Roles`), não generalizada pro resto do projeto.

## Decisão

Acessibilidade segue o mesmo princípio de `docs/adr/0004`/`0010` (baseline obrigatório, não aspiração), guiado por WCAG 2.2 nível AA como referência. Regras concretas, adicionadas a `CONTRIBUTING.md`:

- **`eslint-plugin-jsx-a11y` (`strict`) continua a primeira linha de defesa, automatizada — mas não é suficiente sozinha.** Revisão manual de acessibilidade é esperada em qualquer componente/página nova, cobrindo especificamente o que o lint estático não pega (abaixo).
- **Todo documento HTML declara `lang`** — `app/views/layouts/application.html.erb`, `lang="<%= I18n.locale %>"` (nunca hardcoded, acompanha `I18n.default_locale`, `docs/adr/0014`).
- **Conteúdo dinâmico relevante (erro, aviso, confirmação) usa `role`/`aria-live` apropriado** — `role="status"` (polite) ou `role="alert"` (assertive) conforme a severidade, nunca só uma mudança visual sem anúncio pra quem usa leitor de tela (já seguido pelo `Banner`, agora regra explícita pra qualquer componente novo).
- **Diálogo/modal sempre associa título E descrição via os primitivos do Radix** (`Dialog.Title`/`Dialog.Description`), nunca um `<p>` solto como "descrição" — sem isso, o Radix não monta `aria-describedby`, e a descrição não é anunciada junto da abertura do diálogo.
- **Contraste de cor é calculado, não estimado.** Qualquer par texto/fundo ou indicador de estado de UI (borda de campo inválido, foco) precisa de pelo menos 4.5:1 (texto normal) ou 3:1 (UI/indicador de estado, WCAG 1.4.11) — calculado via fórmula de luminância relativa (`(L1+0.05)/(L2+0.05)`), nunca "parece escuro o suficiente".
- **Grupo de controles relacionados (checkboxes, radios) sempre em `fieldset`/`legend`**, nunca soltos numa `div` — mesma regra já em `CONTRIBUTING.md` pra formulário, agora explicitamente geral (não só o caso de permissões que motivou a regra original).

## Consequências

- `eslint-plugin-jsx-a11y` continua automatizado no CI — pega sintoma sintático. As regras acima cobrem o que só revisão deliberada pega (semântica, contraste real, anúncio dinâmico).
- Os quatro gaps encontrados nesta revisão foram corrigidos no mesmo PR (`docs/bugs/accessibility.md`, categoria nova), cada um com teste de regressão confirmado vermelho→verde.
- Decisão explícita de **não** introduzir uma ferramenta de teste de contraste/axe automatizada agora (ex. `vitest-axe`/`jest-axe`) — a auditoria desta PR foi manual/calculada; se gaps continuarem aparecendo depois dessa revisão, considerar automação como ADR próprio, não adicionar ferramenta nova só por precaução sem um problema concreto recorrente.
- Toda PR nova que adiciona um componente interativo ou conteúdo dinâmico revisa contra as regras acima antes de reportar como concluída — mesmo racional de revisão deliberada já aplicado a segurança (`docs/adr/0010`) e arquitetura (`docs/adr/0004`).
