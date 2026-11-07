# Bugs: estrutura de código

Bugs relacionados a organização de código, namespace, arquitetura e convenção de nomes. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Scaffold padrão do Inertia Rails nunca foi removido, e `root_url`/`root_path` dependiam dele sem documentar essa dependência real

- **Data:** 2026-11-07
- **Severidade:** média
- **PR:** #41

### O que aconteceu

O controller/página/rota/teste gerados automaticamente na criação do projeto (`InertiaExampleController`, `app/frontend/pages/inertia_example/`, `root "inertia_example#index"`) continuavam no repositório sem nunca terem sido removidos, mesmo depois da Fase 3 inteira (autenticação de admin) já estar em produção. Ao tentar removê-los, uma segunda falha apareceu: `AdminPanel::Authentication#after_admin_authentication_url` e `AdminPanel::TwoFactorsController` usam `root_url`/`root_path` como destino intencional de pós-login/pós-2FA (placeholder documentado em comentário até o painel real existir, ver `docs/adr/0013`) — remover a rota `root` sem substituto quebraria esse fluxo real em produção, não só a página de exemplo.

### Causa raiz

Duas causas empilhadas: (1) nenhuma PR anterior tratou a remoção do scaffold padrão como item de limpeza — ele foi ficando porque nunca bloqueou nada visivelmente; (2) a rota `root` acabou servindo dois propósitos ao mesmo tempo sem isso estar explícito — era o destino do scaffold E, via `root_url`/`root_path`, o destino placeholder real do fluxo de autenticação — então remover um "sem querer" quebraria o outro.

### Como foi encontrado

Ao planejar a remoção do scaffold, um `grep` por `root_path`/`root_url` antes de apagar a rota revelou os usos reais em `app/controllers/concerns/admin_panel/authentication.rb` e `app/controllers/admin_panel/two_factors_controller.rb`, além dos specs que já travavam esse redirect (`spec/requests/admin/sessions_spec.rb`, `two_factors_spec.rb`, `two_factor_authentications_spec.rb`) — a remoção só foi feita depois dessa verificação, evitando quebrar o fluxo de autenticação.

### Impacto

Se a rota `root` tivesse sido removida sem substituto, login bem-sucedido, verificação de 2FA bem-sucedida, e ativar/desativar 2FA passariam a redirecionar para uma rota inexistente (erro de roteamento) em vez de qualquer página — quebra em produção do fluxo de autenticação inteiro, não só a perda de uma página de exemplo sem uso.

### Correção

Removidos `app/controllers/inertia_example_controller.rb`, `app/frontend/pages/inertia_example/`, `app/frontend/test/pages/inertia_example/`, `spec/requests/inertia_example_spec.rb`, `spec/system/inertia_example_spec.rb`, e as duas rotas (`root "inertia_example#index"`, `get "inertia-example"`) em `config/routes.rb`. A rota `root` foi mantida (não removida), agora apontando pro único fluxo real que existe hoje: `root to: redirect("/admin/login")` — preserva o placeholder de pós-autenticação (`root_url`/`root_path` continuam resolvendo normalmente) sem depender do scaffold.

### Verificação

`bundle exec rspec` completo (135 exemplos) e os 3 specs que já travavam redirect pra `root_path`/`root_url` (sessions/2FA) continuam verdes sem alteração neles. Novo spec dedicado `spec/requests/root_spec.rb` trava o destino público (`GET /` redireciona pra `new_admin_session_path`) — confirmado vermelho trocando o destino de propósito pra uma URL diferente, verde depois de restaurado. `pnpm test`/`pnpm check`/`pnpm lint`, `bundle exec rubocop`, `bundle exec brakeman` e `vite build` confirmados limpos sem nenhuma referência remanescente ao scaffold.

## `namespace` com `as:` explícito prefixa "admin\_" *antes* do nome dado, quebrando o nome de helper esperado

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #39

### O que aconteceu

Trocando `resource :session, only: %i[new create destroy], path: "login"` por uma rota customizada (`get "login", to: "sessions#new", as: :new_session`) dentro do mesmo bloco `namespace :admin do`, o helper gerado saiu como `admin_new_session_path`, não `new_admin_session_path` como o `resource` original gerava — todo o código existente (controllers, concern de autenticação, specs) que já chamava `new_admin_session_path` quebraria.

### Causa raiz

Dentro de `namespace :admin`, o Rails prefixa `"admin_"` **na frente literal** de qualquer `as:` explícito dado a uma rota (`as: :new_session` vira `admin_new_session`). Isso é diferente de como o roteamento RESTful de `resource`/`resources` nomeia suas rotas internamente — ali, o prefixo `new_`/`edit_` é inserido *antes* do nome namespaced como um todo (`new_` + `admin_session` = `new_admin_session`), não depois dele. As duas convenções de nomenclatura não são intercambiáveis dentro do mesmo `namespace`.

### Como foi encontrado

Rodando `bin/rails routes -g admin` logo depois de trocar `resource :session` por rotas customizadas — o nome do helper apareceu como `admin_new_session`, não `new_admin_session`, antes mesmo de rodar a suíte de specs.

### Impacto

Se não detectado antes de commitar, quebraria em runtime qualquer chamada a `new_admin_session_path`/`new_admin_two_factor_authentication_path` espalhada pelo projeto (redirects do concern de autenticação, controllers, specs) com `NoMethodError: undefined method`.

### Correção

Rotas customizadas de login/2FA movidas pra um bloco `scope path: "admin", module: "admin_panel" do ... end` (sem `namespace`) — `scope` não prefixa nome nenhum sozinho, permitindo escrever o nome final exato via `as:` (`as: :new_admin_session`, `as: :admin_session`, etc.), idêntico ao que o `resource` original gerava. `resources :passwords`/`resource :two_factor` continuam dentro de `namespace :admin` normalmente, já que usam nomenclatura RESTful padrão, sem esse conflito.

### Verificação

`bin/rails routes -g admin` confirmando os nomes de helper exatos (`new_admin_session`, `admin_session`, `new_admin_two_factor_authentication`, `admin_two_factor_authentication`) antes de rodar a suíte; `bundle exec rspec` completo confirmando que nenhum call site existente quebrou. Spec dedicado em `spec/routing/admin_routes_spec.rb` trava tanto o nome do helper quanto a URL pública final (`new_admin_session_path` resolve pra `/admin/login`, não `/admin/login/new`) — confirmado revertendo pra `resource :session`/`resource :two_factor_authentication` de propósito e vendo 4 dos 6 exemplos falharem, antes de restaurar a correção.

## `usePage().props.flash` sempre retornava `undefined` — `flash` não é um prop compartilhado

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #39

### O que aconteceu

`AuthLayout` lia a mensagem de flash via `usePage().props.flash`, e a página inteira quebrava com `TypeError: Cannot read properties of undefined (reading 'notice')` ao carregar `/admin/login/new` direto (sem redirect anterior) no browser — tela em branco.

### Causa raiz

`flash` não é um prop compartilhado via `inertia_share` — é um campo próprio do objeto de página do Inertia, paralelo a `props`, não aninhado dentro dele (`{ component, props, flash, ... }`). O código assumia `usePage().props.flash`; o valor real está em `usePage().flash`. Confirmado inspecionando a resposta JSON real da requisição Inertia (`X-Inertia: true`) no browser: `props` nunca tem a chave `flash`, mesmo depois de um redirect com `alert:`/`notice:` — nesse caso `flash` aparece no nível raiz do payload.

### Como foi encontrado

Testando a página de login num browser real (não só os specs do Vitest, que mockavam `usePage()` com a estrutura errada e por isso nunca pegaram o problema) — a tela ficou em branco já no primeiro carregamento.

### Impacto

Qualquer página usando `AuthLayout` quebrava completamente ao carregar (tela em branco, erro no console) sempre que não houvesse flash pra mostrar — ou seja, na maioria dos acessos diretos (sem vir de um redirect de erro).

### Correção

`AuthLayout` passou a ler `usePage().flash` (não `usePage().props.flash`). `SharedProps` (`app/frontend/types/index.ts`) deixou de declarar `flash` (ele nunca pertenceu a `props`) — ficou vazio até existir um prop de verdade compartilhado via `inertia_share`. `FlashData`/`flashDataType` (que já tipava corretamente o campo `flash` de `usePage()`) permaneceram como estavam.

### Verificação

Reproduzido no browser (tela em branco com o bug, página renderizando normal depois da correção) e via teste automatizado: `AuthLayout.test.tsx` ganhou um caso específico mockando `usePage()` sem a chave `flash` (o cenário real que quebrava) — confirmado vermelho antes da correção, verde depois.

## Namespace `Admin::` colidia com o model `Admin`

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #28

### O que aconteceu

Ao criar o primeiro controller do painel (`Admin::SessionsController`), definir `module Admin; class SessionsController; end; end` levantava `TypeError: Admin is not a module` — o Ruby não permite reabrir uma classe já existente (`class Admin < ApplicationRecord`, o model) como módulo de namespace.

### Causa raiz

`Admin` já existia como classe (o model), e Ruby trata `module`/`class` com o mesmo nome em escopos incompatíveis como erro de tipo — isso só aparece executando o código (carregando o arquivo do controller), não é detectável lendo a definição isoladamente.

### Como foi encontrado

Ao tentar criar o primeiro controller do painel administrativo sob o namespace `Admin::`, a aplicação falhava ao carregar com `TypeError: Admin is not a module`.

### Impacto

Bloqueava completamente a criação de qualquer controller/service sob o namespace `Admin::` enquanto o model `Admin` existisse — qualquer tentativa de seguir a convenção óbvia de nomenclatura (`Admin::SessionsController` pro painel do `Admin`) falhava.

### Correção

Controllers do painel passaram a usar o namespace Ruby `AdminPanel::` em vez de `Admin::`, mantendo a URL/route helper como `admin_session_path` etc. via `namespace :admin, module: "admin_panel"` em `routes.rb` — só a classe Ruby muda de nome, não a rota pública.

### Verificação

Confirmado que `AdminPanel::SessionsController` carrega e resolve normalmente, enquanto uma tentativa deliberada de usar `Admin::SessionsController` reproduz o `TypeError` original. Documentado em `CONTRIBUTING.md` como regra geral: nome de namespace de controller/service nunca pode colidir com o nome de um model já existente.
