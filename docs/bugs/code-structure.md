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

## `PanelLayout` não exibia nenhum flash de notice/alert

- **Data:** 2026-11-09
- **Severidade:** alta
- **PR:** #48

### O que aconteceu

Ao implementar o CRUD de "gerenciar admins", a primeira versão de `AdminsController#create`/`#update` usava `redirect_to ..., inertia: { errors: admin.errors }` (protocolo de erro por campo do Inertia Rails) nas falhas de validação, e o `PanelLayout` (layout de todas as páginas autenticadas do painel) nunca lia `usePage().flash` — só o `AuthLayout` (pré-autenticação) fazia isso. O resultado combinado: tanto o `notice` de sucesso quanto qualquer erro de validação do servidor ficavam completamente invisíveis em qualquer página dentro do `PanelLayout`.

### Causa raiz

Duas lacunas independentes se somando: (1) nenhum componente React do projeto consumia `usePage().props.errors` (o campo que `inertia: { errors: ... }` popula) nem chamava `setError` do React Hook Form com ele — o protocolo estava sendo usado no backend sem nenhum consumidor no frontend; (2) `PanelLayout` nunca foi cabeado pra renderizar `Banner` a partir de `usePage().flash`, diferente do `AuthLayout`, que já fazia isso desde a Fase 3.

### Como foi encontrado

Autorrevisão do próprio diff antes de abrir o PR: ao reler `AdminsController` por completo, ficou evidente que `inertia: { errors: ... }` não tinha nenhum consumidor no frontend. A ausência de flash no `PanelLayout` foi notada em seguida, ao verificar onde esse erro de fato apareceria pro usuário.

### Impacto

Um admin tentando criar outro admin com e-mail já cadastrado (ou atualizar um admin sem motivo de alteração) seria redirecionado de volta ao formulário sem nenhuma explicação visível — parecendo que a ação simplesmente não fez nada. O `notice` de sucesso ("Admin criado com sucesso") também nunca apareceria.

### Correção

`AdminsController#create`/`#update` passaram a usar `redirect_to ..., alert: admin.errors.full_messages.to_sentence` (mensagem localizada via `rails-i18n`/`activerecord.attributes`, mesmo padrão de `PasswordsController#update`). `PanelLayout` passou a renderizar `Banner` a partir de `usePage().flash` (notice/alert), reaproveitando o componente já existente desde o `AuthLayout` — nenhum componente novo foi criado.

### Verificação

`spec/requests/admin/admins_spec.rb` passou a verificar o conteúdo de `flash[:alert]` nos dois cenários de falha (e-mail duplicado, motivo de alteração em branco), não só o redirect. `PanelLayout.test.tsx` ganhou dois casos novos (flash de notice e de alert), confirmados vermelhos removendo a renderização do `Banner` antes de restaurar a correção.

## `Select` (Radix) avisava "changing from uncontrolled to controlled" por falta de `defaultValues`

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #48

### O que aconteceu

Ao integrar o `Select` do Radix com React Hook Form no formulário de criação de admin (`useAdminsNewForm`), o console emitia o aviso do React "A component is changing an uncontrolled input to be controlled" ao escolher um papel.

### Causa raiz

`useForm()` não tinha `defaultValues`, então `role_id` começava como `undefined` — `Select.Root value={undefined}` inicializa "uncontrolled" e passa a "controlled" assim que `onValueChange` seta um valor de fato, no primeiro papel escolhido.

### Como foi encontrado

Aviso real do React apareceu no stderr ao rodar `New.test.tsx`.

### Impacto

Nenhum efeito funcional observado neste caso específico, mas é sinal real de um componente controlado que pode perder sincronização de estado em cenários mais complexos — ignorar o aviso generalizaria mal pra qualquer formulário futuro com `Select`.

### Correção

`useAdminsNewForm` passou a declarar `defaultValues` com string vazia pra todo campo (incluindo `role_id`), garantindo que o `Select` já nasce "controlled". Regra geral documentada em `CONTRIBUTING.md`, seção "Padrões de código".

### Verificação

Aviso desapareceu do stderr do teste depois da correção; reproduzido de novo removendo `defaultValues` de propósito antes de restaurar.

## `request.get?` sozinho trata requisição HEAD como mutação

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #51

### O que aconteceu

O concern `AdminPanel::RequireTwoFactor` (bloqueia mutação de admin sem 2FA ativo) usava só `request.get?` pra liberar visualização — `bundle exec brakeman` passou a sinalizar `VerbConfusion`: "`HEAD` is routed like `GET` but `request.get?` will return `false`".

### Causa raiz

Rails roteia `HEAD` pra qualquer rota `GET` automaticamente (mesmo handler, sem corpo na resposta), mas `request.get?` checa literalmente o método HTTP `GET` — uma requisição `HEAD` real passa pelo mesmo controller/action de uma página de visualização, mas `request.get?` retorna `false` pra ela.

### Como foi encontrado

`bundle exec brakeman` sinalizando `VerbConfusion` logo depois de escrever o concern, antes de qualquer teste manual com `HEAD`.

### Impacto

Uma requisição `HEAD` numa página de visualização qualquer (ex. o dashboard) seria tratada como mutação e bloqueada pro admin sem 2FA ativo — inofensivo na prática (navegador comum nunca manda `HEAD` pra uma página), mas incorreto e exatamente o tipo de inconsistência que detecção automatizada existe pra pegar antes de virar bug real em produção.

### Correção

`request.get? || request.head?` na guarda do concern.

### Verificação

`bundle exec brakeman` limpo (0 warnings) depois da correção; teste novo em `spec/requests/admin/require_two_factor_spec.rb` fazendo `head root_path` e confirmando `200 OK`.

## Remoção do scaffold padrão (PR #41) não incluiu os assets estáticos, só código/rota/página

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #57

### O que aconteceu

A remoção do scaffold padrão do Inertia Rails (PR #41, entrada acima) removeu o controller, a página React e as rotas da página de exemplo, mas deixou passar quatro arquivos estáticos que só existiam pra essa mesma página: `app/frontend/assets/{react,rails,vite_ruby,inertia}.svg` (os logos exibidos na página de exemplo padrão do scaffold).

### Causa raiz

A verificação feita na PR #41 (`grep` por `root_path`/`root_url` e pelas referências ao controller/página) nunca checou especificamente se havia *asset estático* (imagem/SVG) só usado por aquela página — só código (`.rb`/`.tsx`) e rota.

### Como foi encontrado

Revisão deliberada comparando `app/assets/` (pipeline padrão do Rails/Sprockets, só um `.keep` vazio, sem relação com o scaffold) contra `app/frontend/assets/` (pasta de asset estático do Vite) — os dois existem por motivos diferentes e genuínos (dois pipelines de asset coexistindo num setup Rails + Vite, não duplicação), mas o conteúdo de `app/frontend/assets/` era só os 4 SVGs do scaffold já removido, confirmado via `grep` que nenhum arquivo do projeto referencia qualquer um dos quatro.

### Impacto

Baixo: nenhum comportamento quebrado (os arquivos nunca foram servidos nem importados por nada depois da remoção do scaffold), só código morto ocupando espaço no repositório desde a criação do projeto.

### Correção

Removidos os quatro arquivos (`app/frontend/assets/react.svg`, `rails.svg`, `vite_ruby.svg`, `inertia.svg`) — pasta `app/frontend/assets/` fica vazia (sem `.keep`, já que não há nenhum asset estático real ainda; recriar quando houver um).

### Verificação

`grep` confirmando zero referência a qualquer um dos quatro arquivos em `app/`/`config/` antes da remoção. `pnpm test`/`pnpm lint`/`pnpm check`/`pnpm format:check` limpos depois, sem nenhuma referência quebrada.
