# Acessibilidade

Ver [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) para o índice completo de convenções.

**HTML sempre semântico.** Use o elemento certo pro que ele representa (`header`, `nav`, `main`, `section`, `article`, `footer`, `button`, `label`, etc.) em vez de `div`/`span` genérico quando existe elemento semântico apropriado — acessibilidade e SEO dependem disso, e SEO é uma feature explícita do painel admin deste projeto.

**Acessibilidade é baseline obrigatório, não aspiração** (`docs/adr/0028`). `eslint-plugin-jsx-a11y` (`strict`) já pega defeito sintático (label sem associação, `aria-*` inválido) — não é suficiente sozinho, revisão manual é esperada em todo componente/página nova pelo que o lint não cobre:

- `<html>` sempre com `lang` (`app/views/layouts/application.html.erb`, lido de `I18n.locale`, nunca hardcoded).
- Conteúdo dinâmico relevante (erro, aviso) usa `role="status"`/`role="alert"` (ou `aria-live` equivalente) — nunca só uma mudança visual sem anúncio pra leitor de tela.
- Diálogo/modal sempre associa descrição via `RadixDialog.Description` (nunca um `<p>` solto) — sem isso o Radix não monta `aria-describedby`.
- Contraste de cor **calculado** (fórmula de luminância relativa do WCAG), nunca estimado visualmente — mínimo 4.5:1 pra texto normal, 3:1 pra indicador de estado de UI (WCAG 1.4.11, ex. borda de campo inválido). Achado real: `border-red-300`/`dark:border-red-700` do `Input` davam 1.90:1/2.27:1, abaixo do mínimo — corrigidas pra `border-red-500`/`dark:border-red-500` (`docs/bugs/accessibility.md`).
- Grupo de controle relacionado (checkboxes, radios) sempre em `fieldset`/`legend`, nunca solto numa `div`.
- **`<label for="x">` sobrescreve o nome acessível de `x` pelo texto do próprio label, mesmo quando `x` já tem conteúdo visível significativo (ex. um botão mostrando "3 selecionados").** Isso faz sentido pra um `<input>` simples (o conteúdo digitado não é um "nome"), mas destrói o nome de um controle que já diz algo por si — nunca associe `<label for>` a um botão/combobox custom que mostra seu próprio estado; em vez disso, combine o texto do rótulo com o conteúdo via `aria-label` no próprio elemento, e deixe o texto visível sem associação (`<p>`, não `<label>`). Gotcha real encontrado no gatilho do `MultiSelect` (`docs/bugs/accessibility.md`).
