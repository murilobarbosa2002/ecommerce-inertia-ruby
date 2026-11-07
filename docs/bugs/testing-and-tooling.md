# Bugs: testes e ferramentas

Bugs relacionados a RSpec, Vitest, CI, extensões de editor e outras ferramentas de desenvolvimento. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

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
