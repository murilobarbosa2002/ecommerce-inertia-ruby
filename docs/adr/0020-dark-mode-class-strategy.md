# 0020 - Tema claro/escuro via classe, não só `prefers-color-scheme`

## Status

Aceito

## Contexto

Até agora o frontend não tinha tema escuro — toda classe de cor nas páginas de autenticação (PR7 da Fase 3) e nos componentes de `components/shared/` (`docs/adr/0019`) era fixa pro tema claro. Deixar pra decidir isso só quando o painel admin real existir (Fase 5) significaria retrofitar `dark:` em toda página/componente já construído, o retrabalho que a Fase 4 inteira busca evitar.

O Tailwind suporta dark mode de duas formas: seguindo `prefers-color-scheme` do sistema operacional automaticamente (`media`, o padrão), ou via seletor CSS controlado pela aplicação (`@custom-variant dark (&:where(.dark, .dark *));`, aplicando uma classe `.dark` em algum ancestral, geralmente `<html>`). Só a segunda permite um toggle manual que o usuário controla, independente da preferência do SO — a primeira não dá escolha nenhuma ao usuário.

Alternar a classe só depois do React montar (ex. `useEffect`) causa um "flash" visível: a página sempre renderiza no tema claro por um instante antes do JS aplicar o tema correto, mesmo quando o usuário já escolheu escuro antes. A documentação oficial do Tailwind recomenda resolver isso com um `<script>` inline no `<head>`, executado de forma síncrona antes do primeiro paint — essa parte não pode ser React, porque o próprio carregamento do bundle React já é tarde demais.

## Decisão

**Classe, não `media`**: `@custom-variant dark (&:where(.dark, .dark *));` em `application.css` — todo `dark:` do projeto passa a responder à classe `.dark` na `<html>`, controlável por JS, não só à preferência do sistema.

**Script inline em `app/views/layouts/application.html.erb`**, primeira coisa dentro de `<head>`, antes de qualquer tag que dependa de CSS/JS carregado: lê `localStorage.getItem("theme")`, cai pra `window.matchMedia("(prefers-color-scheme: dark)")` se não houver preferência salva, e aplica a classe `dark` imediatamente. Essa lógica é necessariamente duplicada (não importada) em `app/frontend/hooks/useTheme.ts`, porque um `<script>` inline não pode importar módulo ES antes do Vite carregar — é a única duplicação aceita aqui, e as duas cópias precisam ficar em sincronia se a regra mudar.

**Sem Context/Provider**: como `dark:` é 100% dirigido pela classe na `<html>` (CSS puro), a maioria dos componentes não precisa saber o tema atual em JS — só quem renderiza o toggle precisa. `useTheme()` (`app/frontend/hooks/useTheme.ts`, primeiro arquivo em `app/frontend/hooks/` — categoria de hook verdadeiramente global, fora do padrão de hook por página do `docs/adr/0019`) usa `useSyncExternalStore` com um store em module-level (um `Set` de listeners, sem `useState`), garantindo que qualquer instância do hook em qualquer componente fique sincronizada sem precisar embrulhar a árvore inteira num Provider — o que exigiria reescrever o `setup` do `createInertiaApp`, hoje totalmente automático via `@inertiajs/vite` (`pages: "../pages"`, sem `resolve` manual).

**Toggle binário (sol/lua), não três estados**: `ThemeToggle` (`components/shared/theme-toggle/`) alterna só entre claro e escuro — a preferência do sistema só decide o estado inicial na primeira visita (nenhuma chave em `localStorage` ainda); a partir do primeiro toggle, a escolha explícita do usuário (`localStorage.theme`) sempre vence.

## Consequências

- Nenhum "flash" de tema errado no carregamento, em troca de duplicar a lógica mínima de leitura de preferência entre o script inline e `useTheme.ts` — mudança na regra de prioridade (localStorage vs. sistema) precisa atualizar os dois lugares.
- Todo componente de `components/shared/` (`Input`, `Label`, `FieldError`, `Link`, `Banner`) e `AuthLayout` ganham variante `dark:` — página nova que usar esses mesmos componentes já nasce com tema escuro funcionando, sem retrabalho.
- `useTheme()` fica disponível pra qualquer componente futuro que precise saber o tema atual (ex. escolher um ícone diferente), sem precisar de Provider nem de prop drilling.
- Toggle vive por enquanto dentro do `AuthLayout` (único layout existente) — muda de lugar pro layout do painel quando ele existir (Fase 5), sem mudar a lógica do hook.
