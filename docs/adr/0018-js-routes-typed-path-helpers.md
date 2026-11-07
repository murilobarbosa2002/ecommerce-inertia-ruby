# 0018 - js-routes para helpers de rota tipados no frontend

## Status

Aceito

## Contexto

As primeiras páginas reais do painel admin (PR7 da Fase 3) construíam toda URL/ação de formulário como string hardcoded (`href="/admin/login"`, `router.post("/admin/login", data)`). Isso já quase causou um bug real durante a própria PR7: renomear uma rota (`/admin/login/new` → `/admin/login`) quase deixou um link esquecido apontando pra URL antiga, só pego por revisão manual — nada no TypeScript, no lint ou nos testes teria pego isso em compile-time (ver `docs/bugs/code-structure.md`, bug do helper `admin_new_session` vs `new_admin_session` na mesma PR, mesma raiz: nome de rota e código que a referencia divergindo sem aviso).

Rotas do Rails já têm nome (`new_admin_session_path`, `admin_two_factor_authentication_path`, etc.) — o problema é que esse nome só existe no lado Ruby; o frontend não tem acesso a ele, então duplica a URL como string solta. Qualquer rota renomeada, removida ou com parâmetro alterado só quebra em runtime no browser, nunca em build.

Duas gems resolvem isso gerando código TypeScript a partir de `config/routes.rb`: `js_from_routes` (gera uma classe de API client por controller, com métodos de requisição completos) e `js-routes` (gera só os helpers de path/URL, função por função, mesmo shape que o Rails já usa). O projeto não precisa de um API client gerado — as páginas já usam `router.post`/`router.patch` do Inertia diretamente — só precisa dos helpers de path tipados. `js_from_routes` resolveria um problema que este projeto não tem; `js-routes` resolve exatamente o que falta.

## Decisão

Gem `js-routes` (`railsware/js-routes`, `JsRoutes.generate!(typed: true)`) gera `app/frontend/routes.js` + `app/frontend/routes.d.ts` a partir de `config/routes.rb`, expondo cada rota nomeada como uma função TypeScript com o mesmo nome do helper Ruby (`admin_session_path()`, `new_admin_password_path()`, etc. — sem `camel_case`, de propósito, pra manter correspondência 1:1 exata com o nome do lado Ruby). Toda página do admin troca string hardcoded por esses helpers.

Os arquivos gerados são código de terceiro, não editado à mão: gitignorados (`app/frontend/routes.js`, `app/frontend/routes.d.ts`), fora do escopo do ESLint, e regenerados via `bin/rails js:routes` (rake task da própria gem, encadeada em `assets:precompile`) sempre que `config/routes.rb` muda. Em desenvolvimento, `JsRoutes::Middleware` (configurado em `config/environments/development.rb`) regenera automaticamente a cada requisição se o arquivo estiver desatualizado — sem passo manual. No CI, o job `js` passou a precisar do ambiente Ruby completo (antes só rodava Node/pnpm) só pra gerar esses arquivos antes de lint/typecheck/test/build.

## Consequências

- Uma rota renomeada ou removida agora quebra em compile-time (`pnpm check`/`tsc`) em todo call site do frontend, não em runtime no browser — essa é a prova de que resolve o bug real do PR7.
- Dependência de desenvolvimento nova (`js-routes`, grupo `:development` do `Gemfile`) — não entra no bundle de produção do Ruby, só gera arquivos TypeScript estáticos.
- CI (`js` job) ganhou um passo Ruby (`bin/rails js:routes`) que não existia antes — precisa de `RAILS_MASTER_KEY` no ambiente porque qualquer carregamento do Rails (`:environment`) decripta `credentials.yml.enc` no boot (Active Record Encryption, `docs/adr/0013`), mesmo esse job não tendo banco de dados.
- Qualquer página nova do painel (ou, depois, da loja) usa os helpers gerados por padrão — hardcodar uma URL volta a ser o desvio, não o padrão.
