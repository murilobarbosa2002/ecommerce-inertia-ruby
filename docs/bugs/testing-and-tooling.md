# Bugs: testes e ferramentas

Bugs relacionados a RSpec, Vitest, CI, extensões de editor e outras ferramentas de desenvolvimento. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## `Rails.application.routes.append` num spec causava 404 inconsistente só em CI, nunca localmente

- **Data:** 2026-11-07
- **Severidade:** média
- **PR:** #45

### O que aconteceu

`spec/controllers/concerns/admin_panel/authorization_spec.rb` (testa `AdminPanel::Authorization`, que ainda não tem nenhum controller real consumindo) mutava o route set em tempo de execução dentro de um `around`: `Rails.application.routes.append` adicionando uma rota de teste antes de cada exemplo, `Rails.application.reload_routes!` desfazendo depois. Passava sempre localmente (rodado isolado, na suíte completa, com `--order random` em sementes diferentes), mas falhava no CI com `404` num dos dois exemplos, de forma não determinística.

### Causa raiz

Não totalmente confirmada (não reproduzido localmente pra investigar a fundo) — hipótese mais provável é que o route set already-finalizado num boot limpo de processo (exatamente o que o CI sempre faz; o ambiente local já tinha passado por vários reloads manuais de rota antes, durante investigação de outros bugs desta mesma sessão) lida diferente com `append`/`reload_routes!` em sequência rápida do que um processo "usado". Mutar `Rails.application.routes` em tempo de execução dentro de um spec é inerentemente frágil (estado global do processo, não por exemplo) — a lição vale independente da causa raiz exata.

### Como foi encontrado

CI da PR do RBAC (#45) falhando no job `test` com 404 num teste que sempre passava localmente — investigado comparando o comportamento local (sempre verde, inclusive repetido com seeds aleatórios diferentes) com o log do CI.

### Impacto

Teste instável (`flaky`) bloqueando o CI de qualquer PR de forma não reproduzível localmente — o tipo de falha mais cara de diagnosticar, porque "funciona na minha máquina" é literalmente verdade.

### Correção

Removida a manipulação de rota em tempo de execução. Em vez disso: uma rota de teste permanente guardada por `Rails.env.test?` em `config/routes.rb` (`get "admin/authorization-test"`) apontando pra um controller de teste real e permanente (`app/controllers/admin_panel/authorization_test_controller.rb`, só existe pra isso, documentado como tal). Zero mutação de estado global do Rails em tempo de execução — a rota é definida uma vez, no boot, como qualquer outra.

### Verificação

`bundle exec rspec spec/controllers/concerns/admin_panel/authorization_spec.rb --order random`, repetido com sementes diferentes, permanece verde — mas a prova real só vem do próprio CI voltando a passar de forma consistente depois da correção.

## `@testing-library/react` não limpava o DOM entre exemplos (`afterEach(cleanup)` ausente)

- **Data:** 2026-11-07
- **Severidade:** média
- **PR:** #39

### O que aconteceu

O primeiro arquivo de teste com mais de um `render()` em `it`s diferentes do mesmo `describe` (`AuthLayout.test.tsx`) teve um caso falhar com um elemento "fantasma" de uma execução anterior ainda presente no DOM — `queryByRole("status")` encontrava o `<p>` de flash renderizado por um teste anterior, não pelo teste atual.

### Causa raiz

`@testing-library/react` só limpa o DOM entre exemplos automaticamente (`cleanup()` via `afterEach`) quando detecta o framework de teste (Jest ou Vitest com `test.globals: true`). A configuração deste projeto (`vite.config.ts`) não ativa `test.globals`, então essa detecção automática nunca acontecia — qualquer `describe` com múltiplos `render()` acumulava elementos de execuções anteriores no mesmo `document.body`.

### Como foi encontrado

Escrevendo o primeiro teste de componente (`AuthLayout.test.tsx`) com mais de um `render()`/`it()` no mesmo arquivo — testes anteriores do projeto sempre renderizaram só uma vez por arquivo, então o problema nunca tinha aparecido.

### Impacto

Qualquer suíte futura com múltiplos `render()` no mesmo arquivo ficaria sujeita a falso positivo/negativo (elemento de um teste anterior interferindo na asserção do teste atual) sem nenhum aviso — um risco real de teste quebrado por acidente de ordem de execução, não por regressão de verdade.

### Correção

`app/frontend/test/setup.ts` ganhou `afterEach(() => cleanup())` explícito (importado de `@testing-library/react`), rodando pra toda a suíte, não só pro arquivo que encontrou o problema.

### Verificação

Confirmado removendo o `afterEach(cleanup)` de propósito e vendo o teste "does not render flash elements when flash is an empty object" falhar (elemento de um teste anterior ainda no DOM), antes de restaurar a correção.

## `vi.mock` quebrava com `ReferenceError` ao referenciar variável externa direto no factory

- **Data:** 2026-11-07
- **Severidade:** baixa
- **PR:** #39

### O que aconteceu

`vi.mock("@inertiajs/react", () => ({ router: { post: routerPostMock } }))`, com `routerPostMock` declarado como `const routerPostMock = vi.fn()` logo acima, falhava com `ReferenceError: Cannot access 'routerPostMock' before initialization` em todo arquivo de teste de página (`Session/New.test.tsx` e os outros 3).

### Causa raiz

O Vitest hoista a chamada de `vi.mock(...)` pro topo do arquivo (antes de qualquer `const`/`import`), mas só o CALL em si — o corpo do factory roda de verdade só quando o módulo mockado é importado. Quando o factory constrói um objeto literal referenciando a variável diretamente (`{ post: routerPostMock }`), essa referência é avaliada na hora que o objeto é criado; como isso acontece antes da declaração `const routerPostMock = vi.fn()` ser executada (por causa do hoisting do `vi.mock`), a variável ainda não foi inicializada.

### Como foi encontrado

Escrevendo os specs de submissão de formulário das 4 páginas novas — todos os 4 arquivos reproduziam o mesmo erro, pelo mesmo padrão de mock.

### Impacto

Nenhum em produção — é um erro que impede a suíte de teste de rodar (falha ao carregar o arquivo), não um bug de comportamento real. Mas bloqueava completamente os specs de todas as páginas novas até ser corrigido.

### Correção

Declarar a mock function dentro de `vi.hoisted(() => ({ routerPostMock: vi.fn() }))`, que o Vitest garante executar antes de qualquer `vi.mock`, e desestruturar o valor retornado — `const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }))`.

### Verificação

Reproduzido o erro original (sem `vi.hoisted`) nos 4 arquivos antes da correção; confirmado que todos os specs passam a carregar e rodar normalmente depois de trocar para `vi.hoisted`.

## `markdownlint` sinalizava falso positivo de heading duplicado no template de `docs/bugs/`

- **Data:** 2026-11-07
- **Severidade:** baixa
- **PR:** #37

### O que aconteceu

Ao escrever a primeira entrada em `docs/bugs/authentication.md` com duas ocorrências de bug seguindo o template fixo (cada uma com seus próprios `### O que aconteceu`, `### Causa raiz`, etc.), o `markdownlint` (regra `MD024`) sinalizou todos esses subtítulos repetidos como "heading duplicado".

### Causa raiz

A configuração padrão de `MD024` compara o texto de todo heading do documento contra todo outro heading, sem considerar a estrutura — dois `### Causa raiz` em seções (`##`) diferentes contam como duplicados, mesmo pertencendo a entradas completamente distintas. O template de `docs/bugs/` (e, por extensão, de `docs/changelog/`) depende exatamente desse padrão de subtítulo repetido por entrada.

### Como foi encontrado

Rodando `markdownlint-cli2` no primeiro arquivo de categoria populado com mais de um bug, durante a própria tarefa de popular `docs/bugs/` retroativamente.

### Impacto

Qualquer arquivo de `docs/bugs/` com duas ou mais entradas reprovaria o lint de markdown no CI, mesmo com conteúdo correto — bloquearia a cada nova entrada de bug adicionada ao sistema recém-criado.

### Correção

`.markdownlint.json` ganhou `"MD024": { "siblings_only": true }` — com essa opção, só heading repetido sob o mesmo heading-pai é sinalizado, o que corresponde exatamente ao problema real (heading duplicado dentro da mesma entrada), não ao padrão intencional de template repetido entre entradas diferentes.

### Verificação

Confirmado rodando `markdownlint-cli2` antes da configuração (falso positivo em todo `### <subtítulo>` repetido) e depois (0 problemas em todos os arquivos de `docs/bugs/` com múltiplas entradas).

## Rake task com `exit`/`abort` derrubava todo o processo RSpec

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #24

### O que aconteceu

O spec da rake task `admin:create` (que chama `abort`/`exit` em caminhos de erro, ex. e-mail já em uso) derrubava o processo inteiro do RSpec, não só aquele exemplo — qualquer `it` sem uma expectativa explícita de `SystemExit` fazia o runner inteiro parar.

### Causa raiz

`SystemExit` (levantado por `exit`/`abort`) não é uma subclasse de `StandardError` — é `Exception` direto. O RSpec, como a maioria dos test runners Ruby, só resgata `StandardError` nos seus blocos de execução por padrão; `SystemExit` se propaga e mata o processo.

### Como foi encontrado

Escrevendo o spec da rake task `admin:create`, testando o caminho de erro (e-mail já cadastrado): o processo do RSpec encerrava sem rodar os specs seguintes, sem mensagem de falha normal.

### Impacto

Qualquer rake task nova que chamasse `exit`/`abort` em um caminho de erro, se testada sem esse cuidado, interromperia silenciosamente toda a suíte a partir daquele ponto — um risco real pra qualquer contribuição futura que adicionasse uma task nova.

### Correção

`spec/support/rake.rb` stuba `Kernel#exit` pra levantar uma exceção própria (`RakeTaskExited`, subclasse de `StandardError`) em vez do `SystemExit` real, permitindo que o RSpec capture e verifique esse caminho normalmente (`expect { }.to raise_error(RakeTaskExited)`).

### Verificação

Confirmado removendo o stub de propósito e vendo o processo do RSpec morrer no spec de erro da rake task, antes de restaurar o stub e ver a suíte completa passar normalmente.

## `*.test.tsx` dentro de `app/frontend/pages/` vazava pro build de produção

- **Data:** 2026-11-03
- **Severidade:** alta
- **PR:** #10

### O que aconteceu

Um arquivo de teste Vitest (`*.test.tsx`) colocado dentro de `app/frontend/pages/` era tratado pelo plugin `@inertiajs/vite` como uma página de aplicação válida — qualquer `.tsx` dentro dessa pasta é elegível a virar uma rota/entry point do Inertia, teste ou não.

### Causa raiz

O plugin `@inertiajs/vite` identifica páginas por convenção de pasta (`app/frontend/pages/**/*.tsx`), sem distinguir arquivo de teste de componente de página de verdade — a convenção de localização, não a extensão `.test.tsx`, é o que importa pra ele.

### Como foi encontrado

Ao configurar RSpec/Vitest (PR #10) e escrever o primeiro teste de um componente de página, o build de produção (`vite build`) passou a incluir código de teste no bundle final.

### Impacto

Código de teste (incluindo helpers do Vitest/Testing Library) vazando pro bundle de produção servido a usuários reais — aumento de tamanho de bundle sem necessidade e exposição de código que nunca deveria estar ali.

### Correção

Convenção fixada: testes de página nunca ficam em `app/frontend/pages/`, sempre em `app/frontend/test/pages/<mesmo-caminho>/`, importando o componente via alias `@/pages/...`.

### Verificação

Confirmado criando um `*.test.tsx` de propósito dentro de `app/frontend/pages/` e rodando `vite build`, vendo o arquivo de teste aparecer no bundle; movendo pra `app/frontend/test/pages/` e confirmando que o build volta a ficar limpo.

## `rack-attack` é no-op silencioso em teste por causa de `:null_store`

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #28

### O que aconteceu

`config/environments/test.rb` usa `config.cache_store = :null_store`. `rack-attack` guarda o contador de throttle em `Rails.cache` por padrão — nesse ambiente, qualquer chamada de throttle vira um no-op silencioso, sem erro nem aviso.

### Causa raiz

`:null_store` é intencional pra evitar que teste dependa de cache persistente entre execuções, mas qualquer código de produção que dependa de `Rails.cache` pra funcionar (não só cache de performance, mas estado funcional, como contador de rate limit) perde esse comportamento sem avisar.

### Como foi encontrado

Ao escrever o primeiro spec de rate limiting do login (PR #28): o teste passava mesmo comentando a configuração do `rack-attack` de propósito, porque o throttle nunca chegava a contar nada de verdade no ambiente de teste.

### Impacto

Risco de regressão silenciosa: um teste de rate limit escrito sem esse cuidado passaria igual mesmo que o throttle fosse removido do código — exatamente o tipo de teste sem valor de regressão que o projeto proíbe.

### Correção

`spec/support/rack_attack.rb` troca `Rack::Attack.cache.store` por um `ActiveSupport::Cache::MemoryStore` novo a cada request spec, garantindo um throttle de verdade (e isolado entre exemplos) durante os testes.

### Verificação

Confirmado comentando a lógica de throttle do `rack-attack` de propósito e vendo os specs de rate limiting falharem com o `MemoryStore` em uso (antes não falhavam com `:null_store`), depois restaurando a implementação e vendo os specs passarem.

## Todo Tree sem o binário `ripgrep` instalado

- **Data:** 2026-11-04
- **Severidade:** baixa
- **PR:** #29

### O que aconteceu

A extensão `gruntfuggly.todo-tree` do VS Code não encontrava nenhuma tag (`TODO`/`FIXME`/`PENDING-FRONTEND`) no projeto, mesmo com código contendo essas tags — a árvore de pendências aparecia sempre vazia.

### Causa raiz

A extensão depende do binário `ripgrep` (`rg`) pra buscar as tags no código; esse binário não estava instalado neste WSL, e a extensão falha silenciosamente nesse caso (sem erro visível na UI padrão).

### Como foi encontrado

Ao configurar a extensão como ferramenta padrão de rastreamento de pendências, a árvore ficou vazia mesmo com tags conhecidas no código — investigação levou à ausência do binário.

### Impacto

Nenhuma pendência marcada no código era visível na extensão, tornando a convenção de tags (`TODO`/`FIXME`/`PENDING-FRONTEND`) inútil na prática até a correção.

### Correção

`sudo apt install ripgrep` neste WSL. Passo documentado em `docs/environment-setup.md` como pré-requisito de setup.

### Verificação

Confirmado reabrindo a extensão depois da instalação e vendo as tags existentes aparecerem na árvore.

## Todo Tree configurado com chave errada (`todo-tree.ripgrep` em vez de `todo-tree.ripgrep.ripgrep`)

- **Data:** 2026-11-04
- **Severidade:** baixa
- **PR:** #29

### O que aconteceu

Mesmo depois de instalar o `ripgrep` (ver bug anterior), a extensão continuava sem encontrar tags. A configuração em `.vscode/settings.json` apontava o caminho do binário em `todo-tree.ripgrep`, mas essa não é a chave real usada pela extensão.

### Causa raiz

A chave de configuração correta, conforme o `package.json` da própria extensão instalada, é `todo-tree.ripgrep.ripgrep` (aninhada), não `todo-tree.ripgrep`. O VS Code ignora silenciosamente chaves de configuração desconhecidas — não existe nenhum aviso de "chave inválida" pro usuário.

### Como foi encontrado

Depois de confirmar que o `ripgrep` estava instalado e ainda assim a árvore continuava vazia, a chave real foi encontrada lendo o `package.json` da extensão instalada (`~/.vscode-server/extensions/gruntfuggly.todo-tree-*/package.json`), não a documentação.

### Impacto

Mesmo efeito do bug anterior (nenhuma tag visível), mas sem nenhum sinal de que a causa era uma chave de configuração errada — levaria a reinstalar ou reconfigurar a extensão sem necessidade se não fosse investigado a fundo.

### Correção

`.vscode/settings.json` corrigido para `todo-tree.ripgrep.ripgrep` (com o caminho do binário, ex. `/usr/bin/rg`).

### Verificação

Confirmado reabrindo a extensão depois da correção da chave e vendo as tags existentes aparecerem na árvore, com o binário já instalado desde o bug anterior.

## `userEvent.setup()` substitui `navigator.clipboard` por um stub próprio, escondendo o mock de `writeText`

- **Data:** 2026-11-09
- **Severidade:** média
- **PR:** #48

### O que aconteceu

Testando o botão "Copiar" do `PasswordGenerator`, um mock de `navigator.clipboard.writeText` definido via `Object.defineProperty` antes de `userEvent.setup()` sempre aparecia como "nunca chamado" (0 chamadas), mesmo com o botão sendo clicado de verdade e o DOM mostrando o estado "Copiado!" corretamente.

### Causa raiz

`userEvent.setup()` substitui `navigator.clipboard` pelo stub de clipboard dele mesmo, por padrão (`writeToClipboard: true` nesse modo) — qualquer `Object.defineProperty(navigator, "clipboard", ...)` feito antes do `setup()` é sobrescrito por ele, silenciosamente.

### Como foi encontrado

Isolamento sistemático com um arquivo de teste temporário: confirmado que `navigator === window.navigator === globalThis.navigator` (não é problema de realm diferente), confirmado que definir a propriedade imediatamente antes do `render()` funcionava, e que a referência deixava de bater só depois de introduzir `userEvent.setup()` antes do `defineProperty`. Causa raiz confirmada lendo a documentação do `@testing-library/user-event` via Context7.

### Impacto

Teste que parecia estar verificando o comportamento de copiar pro clipboard, mas na prática nunca exercitava o mock — passaria igual com `writeText` quebrado ou removido, sem nenhuma cobertura real.

### Correção

`userEvent.setup({ writeToClipboard: false })` desliga o stub automático; o `Object.defineProperty` do mock de clipboard passou a ser definido depois do `setup()`, não antes. Regra documentada em `CONTRIBUTING.md`, seção "Testes".

### Verificação

Confirmado vermelho (mock com 0 chamadas) na ordem antiga, verde na ordem corrigida com `writeToClipboard: false`.

## `react/prop-types` aponta falso positivo quando `usePage().props` é desestruturado como `props`

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #48

### O que aconteceu

Ao cabear `usePage().props` dentro de `PanelLayout`, `pnpm lint` passou a reportar `'current_admin_permissions' is missing in props validation` e `'current_admin_permissions.includes' is missing in props validation` (regra `react/prop-types`) — mesmo essa chave não tendo nenhuma relação com as props reais do componente `PanelLayout` (`title`, `children`).

### Causa raiz

`eslint-plugin-react`'s `react/prop-types` identifica qualquer variável local chamada `props` dentro de um componente como sendo as props do próprio componente, independente de onde ela de fato venha — nesse caso, `const { props } = usePage()` não tem relação alguma com as props do React.

### Como foi encontrado

Rodando `pnpm lint` depois de cabear o `usePage()` no `PanelLayout`, antes de abrir o PR — os dois erros reportados apontavam pra uma propriedade (`current_admin_permissions`) que não existe nas props do componente, o que não fazia sentido até investigar a causa na regra do plugin.

### Impacto

Nenhum em produção — é um falso positivo de lint, mas bloquearia qualquer PR que cabeasse `usePage().props` dessa forma, sem indicar a causa real na própria mensagem de erro.

### Correção

A desestruturação foi renomeada (`const { props: pageProps } = usePage()`), evitando o nome `props` como variável local dentro do componente. Regra documentada em `CONTRIBUTING.md`, seção "Testes".

### Verificação

`pnpm lint` limpo depois da renomeação; confirmado que o erro reaparece revertendo só o nome da variável pra `props`.

## `params: { chave: [] }` chega no controller como `[""]`, não `[]`

- **Data:** 2026-11-22
- **Severidade:** média
- **PR:** #72

### O que aconteceu

`AdminPanel::QuickActionsController#update` salvava uma string vazia (`""`) como se fosse uma chave de atalho válida sempre que a lista de atalhos escolhidos ficava vazia (nenhum checkbox marcado) — tanto num request spec (`patch admin_quick_actions_path, params: { quick_action_keys: [] }`) quanto, por extensão, num envio real de formulário HTML sem nenhum campo marcado.

### Causa raiz

`x-www-form-urlencoded`/`multipart/form-data` (o formato real de um POST/PATCH de formulário, inclusive o que os helpers de request spec do Rails montam a partir de `params:`) não tem uma forma nativa de representar "um array vazio" — um campo múltiplo sem nenhum valor marcado simplesmente não manda nenhum par chave=valor pro servidor. O Rails, ao reconstruir `params[:quick_action_keys]` como array a partir de zero entradas, produz `[""]` (um elemento com string vazia), não `[]`. `params.permit(quick_action_keys: []).fetch(:quick_action_keys, [])` nunca cai no `[]` default nesse caso — ele recebe `[""]` de verdade.

### Como foi encontrado

Request spec deliberado (`"aceita lista vazia (remover todos os atalhos escolhidos)"`) falhou com `expected: [] / got: [""]` ao implementar o controller, antes de qualquer correção — não foi uma suposição teórica, o teste pegou o comportamento real do Rails na primeira tentativa.

### Impacto

Sem a correção, um admin que desmarcasse todos os atalhos no diálogo de configurar teria `[""]` salvo em `Admin#quick_action_keys` em vez de `[]` — inofensivo pro catálogo de atalhos de hoje (nenhuma chave real é string vazia, então nada aparece a mais), mas um dado sujo persistido sem necessidade, que poderia confundir uma leitura futura desse campo.

### Correção

`params.permit(quick_action_keys: []).fetch(:quick_action_keys, []).compact_blank` — `compact_blank` remove qualquer elemento em branco do array recebido, tratando o `[""]` do formulário vazio exatamente como `[]`. Gotcha generalizável documentado em `CONTRIBUTING.md`: todo parâmetro de array vindo de formulário (checkbox múltiplo, `Select` múltiplo, etc.) deve passar por `compact_blank` antes de ser salvo, nunca assumir que "nenhum selecionado" chega como `[]`.

### Verificação

Request spec confirmado vermelho (`got: [""]`) antes do `compact_blank`, verde depois — sem precisar reverter de propósito, o teste já nasceu pegando o comportamento real do Rails antes de qualquer fix existir.

## Array vazio enviado via `router.reload` (Inertia, GET) nunca chegava nos params do Rails

- **Data:** 2026-11-22
- **Severidade:** média
- **PR:** #72

### O que aconteceu

O filtro de tipo de evento da atividade recente (dashboard) permite desmarcar todos os tipos, esperando que isso mostre zero eventos. Na prática, desmarcar tudo continuava mostrando todos os eventos — o mesmo resultado de nunca ter aplicado filtro nenhum.

### Causa raiz

`router.reload({ data: { activity_event_types: [] } })` do Inertia serializa `data` como query string de uma requisição GET usando a lib `qs`, que **descarta por padrão qualquer chave cujo valor seja um array vazio** — o par chave=valor simplesmente não aparece na URL final. `params[:activity_event_types]` no Rails, então, não chegava como `[]` (array vazio, uma escolha explícita de "nenhum tipo") — chegava como `nil` (chave ausente), indistinguível de "nenhum filtro foi aplicado ainda". O backend tratava os dois casos do mesmo jeito, caindo sempre no padrão de "mostrar todos os tipos".

### Como foi encontrado

Teste de regressão escrito pro cenário "desmarcar tudo mostra zero eventos" falhava mesmo com a lógica de filtro (interseção com os tipos relevantes) aparentemente correta — a investigação revelou que o parâmetro nunca chegava como array vazio no controller, só como ausente.

### Impacto

Desmarcar todos os tipos no filtro de atividade parecia não fazer nada — o admin via a lista inteira continuar aparecendo, sem nenhuma mensagem de erro, parecendo um filtro quebrado.

### Correção

O frontend passou a enviar os tipos escolhidos como uma única string separada por vírgula (`activity_event_types: selected.join(",")`), não um array — uma string vazia (`""`) ainda é enviada normalmente pelo `qs` (`chave=`), diferente de um array vazio. O controller (`AdminPanel::DashboardsController#activity_event_types_param`) passou a checar `params.key?(:activity_event_types)` pra distinguir "parâmetro nunca enviado" (retorna `nil`, mostra todos os tipos relevantes) de "enviado como string vazia" (retorna `[]`, mostra zero eventos) — `AuditEvents::RecentActivity` só aplica esse mesmo fallback quando recebe `nil`, nunca quando recebe `[]`.

### Verificação

Specs de `AuditEvents::RecentActivity` e do request `GET /` cobrindo os três casos (`event_types: nil` → todos; `event_types: []` → nenhum; string vazia via `activity_event_types: ""` no request real → nenhum) — confirmados vermelhos com a lógica antiga (fallback único pra `nil`/`[]`), verdes depois da correção.

## `window.matchMedia` ausente no jsdom quebrava qualquer teste que monta `Popover`

- **Data:** 2026-11-25
- **Severidade:** alta
- **PR:** #82

### O que aconteceu

Um hook novo (`useMediaQuery`, pra decidir se o popover de filtro vira um Drawer no mobile) chama `window.matchMedia` incondicionalmente — React não permite chamar hooks condicionalmente, então todo `Popover` passa a chamar isso no mount, com ou sem a nova opção `drawerOnMobile`. Rodar a suíte derrubou com `TypeError: window.matchMedia is not a function` em todo teste que monta um `Popover` (diretamente ou por trás de `MultiSelect`/`Select`/`DateRangePicker`), não só nos nenhum novo.

### Causa raiz

jsdom (ambiente de teste do Vitest) não implementa `window.matchMedia` — mesma categoria de lacuna já documentada pra `ResizeObserver`/`hasPointerCapture`/`scrollIntoView` em `test/setup.ts`, mas essa API específica nunca tinha sido necessária até existir um hook que a chama de verdade.

### Como foi encontrado

Rodando a suíte completa do frontend depois de implementar `useMediaQuery` e usá-lo em `Popover` — toda a suíte que toca um componente com `Popover` por trás (boa parte do design system) quebrou com o mesmo erro.

### Impacto

Sem a correção, a suíte de frontend inteira ficaria vermelha assim que qualquer componente passasse a usar `useMediaQuery`, inclusive em testes sem nenhuma relação direta com a mudança — um bloqueio bem maior que o escopo real da mudança (um hook novo, uma opção nova no Popover).

### Correção

Stub de `window.matchMedia` em `test/setup.ts`, mesmo padrão já usado pros outros gaps do jsdom: só registrado se a API ainda não existir, sempre retornando `matches: false` (o cenário "desktop", assumido por padrão em todo teste que não testa explicitamente o comportamento mobile). Um teste que precisa simular mobile sobrescreve `window.matchMedia` localmente (ver `test/components/shared/popover/Popover.test.tsx`).

### Verificação

Suíte completa (498 testes) rodada antes (vermelha, erro em cascata) e depois (verde) do stub — mais 3 testes novos em `Popover.test.tsx` cobrindo especificamente o comportamento de `drawerOnMobile` com `matchMedia` simulado como mobile.
