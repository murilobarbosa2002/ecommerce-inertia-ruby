# 0017 - Motion para animações componentizadas no frontend

## Status

Aceito

## Contexto

A primeira animação do frontend (entrada do card de login, PR das páginas de autenticação) foi implementada como `@keyframes`/`animate-*` puro via `@theme` do Tailwind, direto em `app/frontend/entrypoints/application.css`, usada só por `AuthLayout.tsx`. Isso resolve o caso isolado, mas não é reutilizável: qualquer página futura que precisar de uma animação de entrada diferente (direção, duração, delay) exigiria outro `@keyframes` global, sem nenhuma composição possível — o oposto de um sistema de design.

Havia duas alternativas pra animações reutilizáveis no React: continuar expandindo CSS puro com mais `@keyframes` parametrizados via variável CSS, ou adotar uma biblioteca de animação declarativa. CSS puro escala mal pra parametrização por prop (direção, duração, delay por instância exigiria gerar classes dinamicamente); uma lib dedicada resolve isso nativamente via props de componente.

## Decisão

**Motion** (pacote `motion`, a evolução atual do Framer Motion, mesmo time/API) é a biblioteca de animação deste projeto. `app/frontend/components/motion/` reúne primitivos reutilizáveis e parametrizáveis — o primeiro é `Reveal` (fade + slide opcional por `direction`/`duration`/`delay`), que substitui o `@keyframes`/`animate-auth-card-in` que existia só em `AuthLayout.tsx`.

Primitivos de animação vivem nesse diretório separado de `app/frontend/components/admin/`, porque não são específicos do admin — qualquer página futura (painel ou loja) os reusa.

## Consequências

- Nova dependência direta do projeto (~pacote `motion`, GPU-accelerated, tree-shakeable — só o que for importado entra no bundle).
- Animação de entrada deixa de ser CSS global fixo e passa a ser uma prop de componente (`<Reveal direction="up">`), componível com qualquer página nova sem tocar `application.css`.
- Qualquer animação futura mais complexa (gesture, layout animation, `AnimatePresence` pra transição entre páginas) já tem a biblioteca disponível, sem precisar de uma segunda decisão de ferramenta.
- CSS puro continua sendo a escolha padrão pra tudo que não é animação de entrada de componente (ex. `hover:`/`transition-colors` do Tailwind em botões/links) — Motion não substitui transições simples de estado, só entra onde há necessidade real de orquestração/parametrização.
