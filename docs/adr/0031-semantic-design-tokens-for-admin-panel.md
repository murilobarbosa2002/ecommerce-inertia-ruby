# 0031 - Tokens de design semânticos para o painel admin

## Status

Aceito

## Contexto

O painel admin usa cor fixa do Tailwind (`gray-*`, `indigo-*`, `red-*`) escrita direto em cada componente, sempre acompanhada da variante `dark:` correspondente (`docs/adr/0020`). Isso funcionou enquanto o painel era um esqueleto, mas não sustenta uma reformulação visual completa: trocar a cor de marca, o tom dos neutros ou o contraste de um estado exigiria tocar em dezenas de arquivos, e cada `dark:` repetido é uma chance de um par ficar inconsistente com o tema claro.

Além disso, `docs/adr/0028` exige contraste calculado, não estimado. Sem uma fonte única das cores, cada componente reabre essa conta sozinho.

## Decisão

As cores e medidas visuais do painel passam a vir de `app/frontend/styles/tokens.css`, importado por `application.css`, em duas camadas:

- **Escalas cruas** em `@theme`: `brand` (violeta-índigo, cor de marca) e `ink` (neutros com leve tom azulado, pra harmonizar com a marca), mais raio (`rounded-control`, `rounded-card`) e sombra (`shadow-card`, `shadow-popover`).
- **Tokens semânticos** como variáveis CSS declaradas em `:root` (tema claro) e `.dark` (tema escuro, mesma classe de `docs/adr/0020`), expostos como utilitários do Tailwind por `@theme inline`: `canvas`, `surface`, `surface-muted`, `line`, `line-strong`, `fg`, `fg-muted`, `fg-subtle`, `accent`, `accent-hover`, `accent-fg`, `accent-soft`, `accent-text`, `focus-ring`, e os estados `success-*`, `warning-*`, `danger-*`, `info-*` (cada um com `-soft` pro fundo e `-text` pro texto; `success-solid` e `danger-solid` pro preenchimento sólido).

Componente novo usa os tokens semânticos (`bg-surface`, `text-fg-muted`, `border-line`): eles trocam sozinhos entre os temas, sem `dark:` repetido. A regra de `CONTRIBUTING.md` continua valendo pra qualquer cor fixa (ex. `bg-white`, `text-gray-900`), que ainda exige a variante `dark:` correspondente.

Todo valor de cor em `tokens.css` é hexadecimal de 6 dígitos. O teste `app/frontend/test/styles/tokens.test.ts` lê o arquivo e calcula o contraste WCAG de cada par texto/fundo nos dois temas (4,5:1 pra texto, 3:1 pra indicador de UI), e confere que o tema escuro redefine exatamente os mesmos tokens do claro e que cada token vira utilitário. Alterar uma cor sem manter o contraste mínimo quebra o teste.

No tema escuro, o preenchimento de ação principal (`accent`) é um tom mais claro que no tema claro, e o hover é mais escuro, não mais claro: texto branco sobre o hover claro cairia abaixo de 4,5:1.

## Consequências

- Mudar a cor de marca ou o tom dos neutros é editar um arquivo só; os componentes não mudam.
- Componente novo nasce com tema claro e escuro funcionando sem repetir `dark:`.
- O contraste deixa de depender de revisão visual: o teste pega a regressão.
- Duas convenções de cor convivem durante a migração (cor fixa com `dark:` nos componentes ainda não migrados, token semântico nos novos). A reformulação do painel migra os componentes existentes em etapas.
- `vite.config.ts` libera `tokens.css` pra ser lido como texto no Vitest (`test.css.include`), porque por padrão o Vitest devolve string vazia pra qualquer `.css`, inclusive com `?raw`.
- Trocar o formato dos valores (ex. `oklch`) exigiria atualizar o leitor de tokens do teste.
