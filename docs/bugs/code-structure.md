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

## Comentário ERB com tag de saída aninhada vazava texto cru pro HTML, quebrando o script de tema

- **Data:** 2026-11-10
- **Severidade:** alta
- **PR:** #62

### O que aconteceu

Um teste manual no browser (Playwright), feito numa sessão de desenvolvimento normal sem relação direta com nenhuma mudança recente, abriu o console e encontrou um erro de sintaxe JavaScript (`Unexpected identifier 'não'`) em toda página do admin. O snapshot de acessibilidade da página mostrava um bloco de texto em português solto no topo do `<body>`, visível inclusive pro usuário.

### Causa raiz

O comentário ERB (`<%# ... %>`) que documenta o `<script>` inline de tema, em `app/views/layouts/application.html.erb`, citava `<html lang="<%= I18n.locale %>">` como exemplo dentro do próprio texto do comentário. O parser do ERB fecha um comentário no primeiro `%>` que encontrar — inclusive o de uma tag `<%= ... %>` aninhada dentro do comentário — então tudo depois desse `%>` interno (o resto da prosa do comentário, incluindo a palavra `<script>` solta) virava HTML de saída normal. O navegador interpretava essa palavra solta como abertura real de uma tag `<script>`, cujo conteúdo (o resto do comentário em português) se fundia com o `<script>` de tema legítimo logo abaixo, formando um único bloco JavaScript inválido.

### Como foi encontrado

Teste manual no browser via Playwright MCP, abrindo a tela de login — nenhum spec de request pegaria isso, porque `response.body` é comparado como string/regex, nunca interpretado como DOM/JS por um motor de navegador real.

### Impacto

O `<script>` inline de tema (aplica a classe `.dark` antes do primeiro paint, pra evitar flash de tema errado — `docs/adr/0020`) nunca executava, silenciosamente, em toda página do projeto desde a introdução do `<html lang>` (PR #56) — sem nenhum erro do lado do servidor que indicasse o problema. Também expunha prosa interna de comentário (nomes de arquivo, referência a ADR) como texto visível na página renderizada.

### Correção

Reescrito o comentário em `app/views/layouts/application.html.erb` sem nenhuma tag ERB de saída dentro do texto. Gotcha generalizável documentado em `CONTRIBUTING.md` — nunca escrever `<%= ... %>` dentro de um comentário `<%# ... %>`, em nenhum `.erb` do projeto.

### Verificação

Teste de regressão novo em `spec/requests/admin/layout_spec.rb`, confirmado vermelho→verde restaurando o comentário quebrado de propósito. Confirmado também manualmente no browser: console sem erros, `<script>` de tema renderiza intacto.

## Tooltip do botão de recolher/expandir a sidebar ficava preso na tela, ou reabria sozinho num flash

- **Data:** 2026-11-22
- **Severidade:** média
- **PR:** #71

### O que aconteceu

Dois sintomas distintos, causados pela mesma área de código, encontrados em sequência: (1) recolher a sidebar e depois expandi-la de volta (ou vice-versa) com o mouse ainda sobre o botão de alternar podia deixar o tooltip do botão ("Recolher menu"/"Expandir menu") visualmente preso na tela, sobreposto ao conteúdo, em vez de fechar como ao mover o mouse pra fora normalmente; (2) depois de corrigido (1), passou a aparecer um flash rápido (bem menos de 1 segundo) do mesmo tooltip reabrindo sozinho, sem nenhum hover novo, exatamente no instante de expandir a sidebar com o mouse já sobre o botão.

### Causa raiz

Causa raiz do sintoma (1): `Sidebar` (botão de colapso) e `SidebarItem` (link de navegação recolhido) alternavam, via ternário de tipo, entre embrulhar o trigger (botão/link) num `Tooltip` — só quando `collapsed` era `true` — e renderizá-lo puro, sem nenhum wrapper, quando `collapsed` era `false`:

```tsx
{collapsed ? (
  <Tooltip content={toggleLabel} side="right">
    {toggle}
  </Tooltip>
) : (
  toggle
)}
```

Como `Tooltip` (que renderiza `RadixTooltip.Root`) e o botão puro são tipos de elemento diferentes na mesma posição da árvore, o React desmonta o subtree inteiro e monta um subtree novo a cada troca de `collapsed` — o botão nunca é só atualizado, ele é destruído e recriado. Se o ponteiro do mouse estava sobre o botão no instante do clique (o cenário normal: hover abre o tooltip, clique alterna o estado), o `Root` do Radix é desmontado enquanto o tooltip ainda está aberto. Esse unmount abrupto não passa pelo fechamento controlado do Radix (que normalmente remove o `Portal`/`Content` de forma coordenada) — o conteúdo renderizado em `document.body` via `Portal` fica para trás, órfão, sem o elemento que o controlava.

Causa raiz do sintoma (2), que só apareceu depois de corrigir (1): a correção de (1) manteve o `Root`/`Trigger` do Radix sempre montados, variando apenas se o `Content` é renderizado (`content` truthy ou não). Só que o rastreamento de hover do `Root` do Radix roda independentemente de o `Content` estar montado — um hover que começa enquanto `content` é vazio (ex. botão já mostrando o rótulo como texto normal, sem tooltip) ainda dispara `onOpenChange(true)` internamente depois do `delayDuration`, mesmo sem nada pra abrir. Com `open` não controlado (deixado pro Radix gerenciar), esse "quero abrir" ficava latente; assim que `content` passava a ter valor de novo (ex. o clique que recolhe a sidebar, trocando o botão de volta pra ícone+tooltip), o tooltip pipocava já aberto nesse instante, sem esperar um hover de verdade — e sumia pouco depois porque o cursor normalmente não estava mais sobre o gatilho menor/realocado.

### Como foi encontrado

Sintoma (1): reportado pelo mantenedor com captura de tela, usando o painel normalmente no navegador. Reproduzido de forma determinística automatizando um navegador real (Chrome DevTools, via MCP): logado como admin de teste, com o menu lateral recolhido e o cursor posicionado sobre o botão de alternar (disparando o tooltip via hover real), um clique no botão confirmou visualmente o tooltip preso na tela. Tentativas de reproduzir o mesmo sintoma em teste automatizado (jsdom/Testing Library, com `user.hover` + `user.click`) não reproduziram o problema de forma confiável — o timing de abertura/fechamento do Radix em jsdom não corresponde ao de um navegador real o suficiente pra expor a janela de corrida. A causa raiz foi confirmada por uma via mais direta e determinística: verificar que o nó DOM do botão muda de identidade (referência de objeto diferente) entre as duas trocas de `collapsed` — prova de que o elemento estava sendo desmontado e remontado, independente de qualquer timing de mouse.

Sintoma (2): reportado pelo mantenedor logo depois de aplicar a correção de (1), também por observação direta no navegador. Diferente de (1), esse sintoma foi reproduzido com sucesso em jsdom/Testing Library: bastou renderizar `Tooltip` com `content={null}`, simular hover real (`user.hover`) e esperar o `delayDuration` passar, depois trocar (`rerender`) pra `content="Dica"` — o tooltip aparecia sem nenhum hover novo, confirmando a causa raiz sem precisar de automação de navegador.

### Impacto

Visual apenas (nenhum dado ou permissão envolvidos). Sintoma (1): o tooltip preso cobria parte do conteúdo abaixo dele até a próxima interação que fizesse o React re-renderizar aquele ponto da árvore, exigindo recarregar a página ou interagir de novo com o botão pra "limpar" o estado. Sintoma (2): flash rápido e incômodo visualmente, mas sem persistir na tela.

### Correção

Para (1): `Tooltip` (`components/shared/tooltip/`) passou a embrulhar o trigger incondicionalmente; só o `Content` (dentro do `Portal`) é renderizado condicionalmente, conforme o `content` recebido seja truthy. `Sidebar` e `SidebarItem` foram ajustados para sempre passar o botão/link pelo mesmo `Tooltip`, variando apenas o `content` (`collapsed ? rótulo : null`) em vez de alternar a presença do wrapper. Gotcha generalizável documentado em `CONTRIBUTING.md`, seção "Padrões de código": nenhum elemento controlado por um primitivo Radix de abrir/fechar deve alternar entre "com wrapper"/"sem wrapper" via ternário de tipo.

Para (2): `open` do `RadixTooltip.Root` passou a ser totalmente controlado por `Tooltip` (`useState` próprio), e todo pedido de abrir (`onOpenChange(true)`) vindo do Radix só é aceito quando há `content` disponível (`hasContent`) — fechar (`onOpenChange(false)`) continua sempre aceito. Isso elimina o "quero abrir" latente que o Radix guardava durante o hover sem conteúdo, impedindo que ele resurja quando `content` volta a ter valor.

### Verificação

Para (1): teste de regressão novo em `Sidebar.test.tsx` verifica que o nó do botão não muda de identidade (`toBe`, igualdade de referência) entre `collapsed=true` e `collapsed=false`. Confirmado vermelho restaurando a implementação anterior (o nó mudava) e verde com a correção aplicada. O sintoma visual em si foi reproduzido e confirmado corrigido manualmente no Chrome (automação de navegador via MCP), antes e depois da correção, já que não é capturável de forma confiável em jsdom.

Para (2): teste de regressão novo em `Tooltip.test.tsx` (hover real com `content={null}`, espera o delay, troca pra `content` preenchido, confirma que nenhum tooltip aparece sem hover novo) — confirmado vermelho com uma primeira tentativa de correção insuficiente (`useEffect` resetando `open` só na transição `hasContent: true → false`, que não cobre o caso em que `hasContent` já nasce `false`) e verde com a correção final (filtrar `onOpenChange` por `hasContent`). Também confirmado manualmente no Chrome via gravação quadro a quadro (`requestAnimationFrame`) de um clique real: o tooltip fecha uma vez e nunca reaparece durante toda a transição de largura da sidebar.

## Nav da sidebar desenhava uma barra de rolagem horizontal nativa por um instante ao expandir o menu

- **Data:** 2026-11-22
- **Severidade:** baixa
- **PR:** #71

### O que aconteceu

Ao expandir a sidebar recolhida (com o mouse em qualquer posição, sem relação com o tooltip do botão de alternar), aparecia por uma fração de segundo uma barra de rolagem horizontal nativa do navegador dentro do menu, bem acima do botão de recolher/expandir — sem nenhuma barra equivalente ao recolher.

### Causa raiz

O rótulo de texto de cada item de navegação (`SidebarNav`) volta a ficar visível no mesmo render em que `collapsed` passa a `false` — não há nenhuma animação própria nesse texto. A largura do `<aside>`/`<nav>`, por outro lado, anima via CSS (`transition-[width] duration-200`) ao longo de ~170ms. Durante essa janela, o conteúdo do `<nav>` (`scrollWidth`, já contando o rótulo inteiro) ficava mais largo que o próprio `<nav>` (`clientWidth`, ainda seguindo a largura intermediária da animação) — confirmado instrumentando o navegador real: por alguns frames, `scrollWidth` chegava a 155px enquanto `clientWidth` ainda estava entre 72px e 115px.

Isso por si só causaria overflow, mas não deveria desenhar scrollbar nenhuma no eixo X, já que `SidebarNav` só define `overflow-y-auto`, sem tocar em `overflow-x` (que fica no valor inicial `visible`). O problema é que a especificação de overflow do CSS não permite a combinação "um eixo `auto`/`scroll`, outro `visible`" — quando isso acontece, o navegador força o eixo `visible` a se comportar como `auto` também, pra não deixar o conteúdo escapar sem controle da caixa. Confirmado com `getComputedStyle(nav).overflowX` retornando `"auto"` mesmo sem nenhuma classe Tailwind pra isso. Esse `auto` "fantasma" é o que fazia o navegador desenhar a barra de rolagem horizontal nativa durante a janela de overflow momentâneo.

### Como foi encontrado

Reportado pelo mantenedor, inicialmente confundido com o tooltip (mesma região da tela, mesmo gatilho — expandir o menu). Como o sintoma não reproduzia em nenhuma tentativa de automação de navegador baseada em tooltip/DOM de alto nível, foi necessário instrumentar a página ao vivo via `evaluate_script` (Chrome DevTools MCP): um laço de amostragem a cada `requestAnimationFrame`, registrando `nav.scrollWidth`/`nav.clientWidth` durante um clique real no botão de expandir. Isso capturou objetivamente a janela de overflow (~50ms, 3-4 frames) e o `overflow-x` computado como `"auto"`, confirmando a causa raiz sem depender de interpretação visual de screenshot/vídeo.

### Impacto

Visual apenas, cosmético: nenhum dado, navegação ou permissão envolvidos — só uma barra de rolagem nativa aparecendo e desaparecendo rápido demais pra interagir com ela, mas perceptível o suficiente pra ser notada pelo mantenedor em uso normal do painel.

### Correção

`SidebarNav` passou a declarar `overflow-x-hidden` explicitamente (além do `overflow-y-auto` já existente), fixando o eixo X como sempre oculto — nunca mais computa como `auto`, então nenhuma barra de rolagem horizontal é desenhada, mesmo durante a janela de overflow momentâneo da transição (o conteúdo é só cortado, de forma imperceptível, já que a largura alcança o conteúdo antes dos ~200ms da transição terminarem). Gotcha generalizável documentado em `CONTRIBUTING.md`, seção "Padrões de código": sempre declarar `overflow-x`/`overflow-y` juntos ao usar qualquer um dos dois, nunca confiar no valor inicial (`visible`) do outro eixo.

### Verificação

Teste de regressão novo em `Sidebar.test.tsx` (`describe("SidebarNav")`) verifica que o `<nav>` tem a classe `overflow-x-hidden` — confirmado vermelho antes da correção (classe ausente) e verde depois. jsdom não calcula layout real (`scrollWidth`/`clientWidth` sempre zero), então o teste automatizado trava a causa raiz (a classe que fixa o eixo) em vez do sintoma visual em si; o sintoma e sua ausência após a correção foram confirmados com dados reais de navegador (instrumentação por `requestAnimationFrame` descrita acima).

## `Avatar` com `delayMs` fixo fazia as iniciais demorarem pra aparecer sem foto

- **Data:** 2026-11-22
- **Severidade:** baixa
- **PR:** #68

### O que aconteceu

`Avatar` (Radix Avatar, usado no menu da conta e em listas de admin) aplicava `delayMs={300}` fixo no `Avatar.Fallback`, mesmo quando não havia nenhuma foto (`src`) pra carregar — as iniciais do nome, que deveriam aparecer de imediato, só apareciam depois de ~300ms.

### Causa raiz

`delayMs` no Radix Avatar existe pra evitar um flash do fallback durante o breve instante em que uma imagem real ainda está carregando — faz sentido só quando existe `src`. Aplicado incondicionalmente, o mesmo atraso passa a valer também no caso sem foto nenhuma, onde não há imagem carregando e portanto nenhum flash a evitar — só um atraso artificial sem propósito.

### Como foi encontrado

Durante a implementação do componente, verificado que as iniciais não apareciam de imediato ao renderizar `Avatar` sem `src`.

### Impacto

Em qualquer lista ou menu usando `Avatar` sem foto configurada (a maioria dos admins, que não têm avatar customizado), as iniciais do nome ficavam ausentes por ~300ms a cada render — perceptível como um "pisca" na interface, sem nenhum benefício de UX em troca.

### Correção

`delayMs` passou a ser condicional: `delayMs={src ? 300 : undefined}` — o atraso só se aplica quando há uma foto de fato carregando; sem `src`, o fallback (iniciais) renderiza de imediato.

### Verificação

Testes de `Avatar.test.tsx` ("mostra as iniciais quando não há foto" e "gera as iniciais a partir de um e-mail") confirmados vermelhos aplicando `delayMs={300}` incondicional de propósito (iniciais não apareciam no primeiro render), verdes depois da correção condicional.

## Linha divisória do drawer mobile parava antes do botão de fechar

- **Data:** 2026-11-22
- **Severidade:** baixa
- **PR:** #69

### O que aconteceu

No drawer de navegação mobile (`MobileNav`), a linha divisória sob o cabeçalho (marca da loja + botão de fechar) só cobria a largura da marca — parava antes do botão de fechar, em vez de atravessar o cabeçalho inteiro.

### Causa raiz

`SidebarBrand` tem uma variante `bordered` (usada por padrão na sidebar normal) que desenha a própria linha divisória na raiz do componente. No `MobileNav`, a marca é envolvida por um `<div className="flex-1">` ao lado do botão de fechar — a borda desenhada na raiz do `SidebarBrand` ficava restrita à largura desse wrapper (só a marca), nunca alcançando o botão ao lado.

### Como foi encontrado

Verificado visualmente durante a implementação do shell do painel (PR #69), comparando o drawer mobile com o comportamento esperado da sidebar normal.

### Impacto

Visual apenas: o cabeçalho do drawer mobile ficava com uma linha divisória incompleta, cortada no meio em vez de atravessar até a borda, perceptível em qualquer abertura do menu no mobile.

### Correção

O próprio `<div className="flex items-center border-b border-line">` que envolve a marca e o botão de fechar passou a desenhar a linha divisória; `SidebarBrand`, dentro dele, passou a receber `bordered={false}` — sem isso, a borda ficaria duplicada (uma vez no wrapper, cobrindo tudo, e de novo só sob a marca).

### Verificação

Teste novo em `MobileNav.test.tsx` ("desenha a linha divisória uma única vez, sob o cabeçalho inteiro") verifica que existe exatamente um elemento com as classes `border-b border-line` no drawer aberto, e que ele contém o botão de fechar — confirmado vermelho restaurando `bordered` (sem `={false}`) de propósito (a asserção de quantidade falhava, 2 elementos com a classe em vez de 1), verde com a correção restaurada.

## Nome/sobrenome do admin logado nunca chegavam ao menu da conta nem ao avatar

- **Data:** 2026-11-24
- **Severidade:** média
- **PR:** #80

### O que aconteceu

A PR que adicionou `first_name`/`last_name` ao `Admin` (#79) atualizou a listagem/formulários de Admins, mas não `AdminPanel::BaseController#current_admin_json` — a identidade do admin logado, compartilhada em toda página pro menu da conta (`UserMenu`) e pro avatar do topo. O menu continuava mostrando só e-mail e papel, e o `Avatar` continuava gerando as iniciais a partir do e-mail, nunca do nome de verdade.

### Causa raiz

`current_admin_json` (identidade do admin logado) e `admin_json` (serialização de um admin na tela de Admins) são dois pontos de serialização separados e nunca foram tratados como a mesma mudança — a PR #79 atualizou só o segundo.

### Como foi encontrado

Reportado pelo mantenedor ao abrir o menu da conta no navegador: o nome não aparecia em lugar nenhum, e o avatar mostrava iniciais derivadas do e-mail em vez do nome real.

### Impacto

Admin logado não via o próprio nome em lugar nenhum da interface, e o avatar não refletia a identidade real.

### Correção

`current_admin_json` passou a incluir `first_name`/`last_name`; `SharedProps`, `PanelLayout` e `UserMenu` (nova prop `name`, usada também no `Avatar`) atualizados.

### Verificação

`spec/requests/admin/dashboards_spec.rb` e os testes de `UserMenu` confirmados vermelhos removendo os campos novos de `current_admin_json` e do componente de propósito, verdes com a correção restaurada.
