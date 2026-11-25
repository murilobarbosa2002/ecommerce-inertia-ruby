# 0037 - DataTable responsiva: tabela no desktop, cartões + Drawer no mobile

## Status

Aceito

## Contexto

A `DataTable` genérica (`docs/adr/0033` já antecipava essa peça) precisa funcionar em qualquer largura de tela — as primeiras telas que vão usá-la (Admins, Papéis) já são acessadas também pelo celular. Uma tabela HTML comum não cabe numa tela estreita sem um dos dois problemas de sempre: rolagem horizontal (perde contexto de qual linha/coluna se está vendo) ou colunas cortadas/escondidas (perde informação sem um jeito de recuperá-la).

## Decisão

`DataTable` renderiza duas representações da mesma lista de linhas, uma visível por vez via classe responsiva do Tailwind (`hidden lg:block` / `lg:hidden`), sem duplicar lógica de ordenação/dado:

- **Desktop (`lg:` e acima):** a tabela comum, com cabeçalho ordenável (`data-table-header-cell/`) e `rowActions` como coluna extra.
- **Mobile (abaixo de `lg`):** cada linha vira um cartão resumido (primeira e segunda coluna declaradas, ex. nome + e-mail) com um ícone de seta indicando que é tocável. Tocar o cartão abre um **Drawer** (bottom sheet, novo componente em `components/shared/drawer/`) mostrando as colunas restantes (a primeira já é o título do Drawer, não se repete) como par rótulo/valor e `rowActions` embaixo — em vez de rolagem horizontal ou colunas escondidas, o detalhe completo da linha fica a um toque de distância.

`Drawer` é construído sobre `RadixDialog` (mesmo padrão de composição do `Dialog`/`Popover` já existentes), ancorado na borda inferior da tela, sempre fechável (Esc, clique fora, botão de fechar, ou **arrastando o painel pra baixo** — gesto real de bottom sheet no mobile, via `drag="y"` do Motion: abaixo de 120px de deslocamento ou de uma velocidade de 500px/s o painel volta sozinho ao lugar, `dragSnapToOrigin`). Ganha **`SlideFade`** (novo primitivo em `components/motion/`, irmão do `ScaleFade` já usado por Popover/Dialog) para a animação de entrada/saída — fade + deslocamento direcional em vez de fade + escala, mais adequado a um painel que entra pela borda da tela; mesmo guard de `prefers-reduced-motion` dos outros primitivos de `components/motion/` (o arrasto em si, por ser gesto do usuário, não é afetado por essa preferência).

`rowActions` recebe o contexto de onde está sendo renderizado (`"table"` | `"drawer"`), porque o espaço disponível muda o que é descobrível: numa linha de tabela estreita, um botão de ícone com menu (`DropdownMenu`) é o padrão já estabelecido; dentro do Drawer, que tem a largura toda do painel, esconder a ação atrás de um menu se mostrou pouco acessível num teste real no navegador — o Drawer usa botões com rótulo visível direto. Cada tela que usa `DataTable` decide, no próprio `rowActions`, qual componente renderizar pra cada contexto (ex. `AdminRowActionsMenu`/`AdminRowActionsButtons`) — a lógica compartilhada entre os dois (permissão, confirmação) vive num hook próprio ao lado deles (`docs/adr/0029`), nunca duplicada.

## Consequências

- Nenhuma tela que usar `DataTable` precisa pensar em responsividade por conta própria — o componente já resolve os dois layouts.
- `SlideFade` fica disponível pra qualquer painel futuro ancorado numa borda (ex. um filtro lateral no mobile), do mesmo jeito que `ScaleFade` já serve qualquer abertura centralizada/popover.
- As duas representações (tabela e lista de cartões) ficam ambas no DOM o tempo todo, escondidas por CSS — mais nós renderizados que uma solução só-JS que troca o layout, mas evita duplicar o estado de ordenação/busca/Drawer em dois componentes separados, e é consistente com o padrão já usado no projeto (`docs/adr/0020`, tema por classe, não troca de árvore).
- Jsdom não aplica media query real (`docs/bugs/code-structure.md`, já documentado pra outro caso de layout) — os testes de `DataTable` verificam a estrutura (cartão existe, Drawer abre com os dados certos), não a visibilidade real por breakpoint, que fica só a cargo do CSS.
