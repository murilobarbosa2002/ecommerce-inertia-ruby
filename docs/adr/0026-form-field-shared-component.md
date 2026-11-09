# 0026 - Componente `FormField` pro trio label/input/erro repetido

## Status

Aceito

## Contexto

Toda página com formulário repetia o mesmo trio de três elementos pra cada campo de texto/senha/e-mail/código: um `Label` associado por `htmlFor`, um `Input` com `invalid={!!errors.campo}` e `{...register("campo")}`, e um `FieldError` condicional mostrando a mensagem traduzida. Revisão encontrou esse trio copiado quase identicamente em 9 componentes de formulário (`AdminsNewForm`, `AdminsEditForm`, `RolesNewForm`, `RolesEditForm`, `PasswordNewForm`, `PasswordEditForm`, `ChangePasswordForm`, `DisableTwoFactorForm`, `SessionNewForm`, `TwoFactorNewForm`, `TwoFactorAuthenticationNewForm`) — qualquer ajuste na estrutura desse trio (ex. mudar onde o espaçamento entra, ou como o atributo `invalid` é calculado) exigiria tocar em até 11 arquivos manualmente, sem garantia de ficarem consistentes entre si.

Considerou-se também um sistema mais genérico, orientado por configuração (um array declarando `{ name, type, label, ... }` por campo, mapeado pra gerar o formulário inteiro) — descartado: os campos reais não são uniformes. `role_id` usa `Select` com `Controller` (não `register` direto); `permission_ids` usa um grupo de `Checkbox` dentro de `fieldset`; `password_confirmation` tem mensagem de erro condicional ao `error.type` (`"custom"` vs. obrigatório); existe um `PasswordGenerator` inserido entre dois campos. Forçar todos esses casos num sistema de configuração genérico tende a acumular tantas exceções/opções especiais quanto o código explícito que ele substituiria — abstração mais complexa do que o problema que resolve, especialmente pra ~11 formulários.

## Decisão

Componente `FormField` (`components/shared/form-field/`, docs/adr/0019) só pro caso realmente uniforme: um campo de texto/senha/e-mail/código ligado via `register()`. Recebe `id`, `label`, `error` (mensagem já traduzida, ou `undefined`) e `register` (o retorno de `register("campo")`), repassando qualquer outra prop nativa de `<input>` (`type`, `autoComplete`, `inputMode`, etc.) direto pro `Input` por spread. Internamente só compõe `Label`+`Input`+`FieldError`, cada um já com a própria variante `tv()` — por isso sem `FormField.variants.ts` (só `.types.ts` e `.tsx`), refinamento da exceção já prevista em `docs/adr/0019` pra primitivo sem variante própria: aqui há prop própria mas nenhuma variante própria, então só o arquivo que corresponde a uma responsabilidade real é criado.

`Select`/`Controller`, grupo de `Checkbox`/`fieldset` e `PasswordGenerator` continuam explícitos em cada formulário — não entram no `FormField`, porque cada um já difere o suficiente (controle via `Controller` em vez de `register`, estrutura de grupo em vez de campo único) pra abstrair sem perder clareza.

## Consequências

- Mudar a estrutura do trio label/input/erro (ex. espaçamento, como `invalid` é calculado) agora é uma mudança num arquivo só.
- Campo novo em qualquer formulário futuro usa `FormField` por padrão quando for um `register()` simples — só sai do padrão (JSX explícito) quando for genuinamente um controle diferente (`Select`, `Checkbox`, grupo).
- `FormField` testável isoladamente (`app/frontend/test/components/shared/form-field/FormField.test.tsx`), sem precisar montar um formulário inteiro pra verificar erro/estilo/repasse de prop.
- Decisão explícita de **não** generalizar pra um sistema de formulário orientado por configuração — se os formulários do projeto crescerem a ponto da maioria dos campos realmente ficar uniforme (não é o caso hoje), revisitar essa decisão com um ADR próprio, não expandir `FormField` aos poucos até ele virar esse sistema por acidente.
