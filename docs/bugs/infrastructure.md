# Bugs: infraestrutura

Bugs relacionados a banco de dados, cache, criptografia, variáveis de ambiente e deploy. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Dado de bootstrap do RBAC só existia dentro de uma migration, nunca em `db/seeds.rb`

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #45

### O que aconteceu

A primeira versão da migration `AddRoleToAdmins` criava a role `owner` e a permissão `manage_admins` direto no código da migration (`up`), pra poder fazer o backfill de `role_id` nos admins já existentes antes de tornar a coluna not null. Isso funciona pra um banco que já existia e passou pela migration de verdade — mas um banco **criado do zero** via `bin/rails db:schema:load`/`db:setup` (o caminho normal pra bootstrapar qualquer ambiente novo: clone local, CI, primeiro deploy em produção) carrega `db/schema.rb` direto, sem re-executar nenhuma migration antiga. Nesse caminho, a role `owner` nunca seria criada — `Admin.new(role: ...)` falharia sempre, incluindo a própria `bin/rails admin:create` (criação do primeiro admin do sistema).

### Causa raiz

Dado de bootstrap necessário em todo ambiente (não só "ambientes que vieram de um `db:migrate` completo desde o commit que introduziu a tabela") pertence a `db/seeds.rb`, carregado por `db:seed`/`db:setup`/`db:prepare` independente de como o schema chegou até ali — nunca só dentro do código de uma migration, que só roda nesse bootstrap específico se o histórico de migrations for reproduzido passo a passo (o que `db:schema:load` deliberadamente não faz, por design, pra ser rápido).

### Como foi encontrado

Rodando `bin/rails db:test:prepare` (o mesmo comando que o job `test` do CI já usa) e conferindo `Role.count` no banco de teste resultante: `0`, mesmo a migration de seed já tendo rodado no banco de desenvolvimento local segundos antes.

### Impacto

Qualquer ambiente novo bootstrapado via `db:schema:load`/`db:setup` (todo CI, todo clone novo do projeto, um primeiro deploy em produção) ficaria permanentemente sem a role `owner` — `bin/rails admin:create` falharia sempre com erro de validação (`role` em branco), sem nenhuma mensagem explicando o porquê, bloqueando a criação do primeiro admin do sistema inteiro.

### Correção

Role `owner` + permissão `manage_admins` passaram a ser seedadas (`find_or_create_by!`, idempotente) em `db/seeds.rb`, carregado em todo ambiente independente do caminho de bootstrap. A migration continua criando os mesmos registros (necessário só pra fazer o backfill de admins pré-existentes num banco real sendo atualizado), mas deixou de ser a única fonte. `bin/rails admin:create` passou a checar explicitamente que a role `owner` existe antes de tentar criar o admin, saindo com uma mensagem clara (`"Role \"owner\" não encontrada — rode bin/rails db:seed antes de criar o primeiro admin."`) em vez de um erro de validação genérico.

### Verificação

`spec/db/seeds_spec.rb` carrega `db/seeds.rb` de verdade (`load Rails.root.join("db/seeds.rb")`) e confirma que a role `owner` com a permissão `manage_admins` existe depois, e que rodar de novo não duplica nada (idempotência) — confirmado vermelho comentando o conteúdo de `db/seeds.rb` de propósito antes de restaurar, verde depois. `spec/tasks/admin_rake_spec.rb` ganhou um caso pro cenário "role owner não existe" (banco sem seed).

## Job `test` do CI não gerava `app/frontend/routes.js`, quebrando toda página que o importa

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #42

### O que aconteceu

O job `test` do CI falhou com `ViteRuby::MissingEntrypointError`/`UNLOADABLE_DEPENDENCY: Could not load app/frontend/routes` em 6 exemplos de `spec/requests/admin/two_factors_spec.rb`, mesmo `bundle exec rspec` completo passando localmente antes de abrir a PR.

### Causa raiz

`app/frontend/routes.js`/`routes.d.ts` (gerados por `js-routes`, `docs/adr/0018`) são gitignorados — só existem depois de `bin/rails js:routes` rodar. O job `js` do CI já tinha esse passo (só ele precisava, até então, dos arquivos gerados), mas o job `test` não — e localmente, o arquivo já estava gerado em disco de uma execução manual anterior, mascarando a ausência do passo em qualquer teste local. Qualquer request/system spec que exercita uma página Inertia de verdade (como as de `AdminPanel::TwoFactorsController`) aciona o build real do Vite, que agora falha pra **qualquer** página do bundle que importe `@/routes` (não só a página sob teste) se o arquivo gerado não existir.

### Como foi encontrado

CI da PR do js-routes (#42) falhando no job `test`, apesar do mesmo `bundle exec rspec` ter passado localmente — reproduzido localmente apagando `app/frontend/routes.js`/`routes.d.ts` de propósito (simulando um checkout limpo) antes de investigar.

### Impacto

Bloquearia o job `test` do CI de qualquer PR depois desta que tocasse uma página Inertia renderizada por request/system spec — só passaria num ambiente que, por acaso, já tivesse os arquivos gerados manualmente em disco, como aconteceu neste ambiente de desenvolvimento.

### Correção

Passo "Generate js-routes" (`bin/rails js:routes`) adicionado também ao job `test` do CI (`.github/workflows/ci.yml`), antes de `bin/rails db:test:prepare`/`bundle exec rspec` — mesmo passo que já existia só no job `js`.

### Verificação

Reproduzido localmente: `rm app/frontend/routes.js app/frontend/routes.d.ts` seguido de `bundle exec rspec spec/requests/admin/two_factors_spec.rb` reproduz os 6 failures exatos do CI; `bin/rails js:routes` seguido do mesmo comando volta a 8 exemplos, 0 failures. `bundle exec rspec` completo confirmado limpo (135 examples) depois de regenerar.

## Gem de ambiente `:development` quebrava `bundle exec rspec` inteiro em `RAILS_ENV=test`

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #42

### O que aconteceu

Depois de adicionar `js-routes` (`group :development do`) e seu initializer gerado (`config/initializers/js_routes.rb`, chama `JsRoutes.setup` incondicionalmente), `bundle exec rspec` parou de carregar — `NameError: uninitialized constant JsRoutes` ao carregar `config/environment.rb`, e todo arquivo de spec restante falhava em cascata com `FrozenError: can't modify frozen Array` (efeito colateral do boot abortado no meio, não um segundo bug independente).

### Causa raiz

Initializers do Rails rodam em **todo** ambiente, independente de em qual `group` do `Gemfile` a gem está. `js-routes` estava só em `group :development`, então `Bundler.require` nunca a carregava em `RAILS_ENV=test` — mas o initializer gerado automaticamente pela gem (`bin/rails generate js_routes:install`) sempre referencia a constante `JsRoutes` sem guarda nenhuma, assumindo que a gem está disponível no ambiente atual.

### Como foi encontrado

Rodando `bundle exec rspec` completo antes de abrir a PR do js-routes (passo de verificação já padrão do projeto) — o job `js` do CI já roda com `RAILS_ENV=test` de propósito (gera `app/frontend/routes.js`/`routes.d.ts` sem precisar de banco), então o mesmo erro apareceria lá também se não detectado antes.

### Impacto

Bloquearia `bundle exec rspec` (e o job `test`/`js` do CI) completamente pra qualquer PR depois desta, até alguém investigar por que 26 arquivos de spec davam erro de carregamento sem relação aparente com a mudança de cada um.

### Correção

`js-routes` movida pra `group :development, :test do` (bloco já existente no `Gemfile`, usado por `rspec-rails`/`factory_bot_rails`/etc.) em vez de `group :development do` (que continua só com `web-console`/`tidewave`, que de fato nunca devem carregar em teste).

### Verificação

Confirmado pelo próprio `bundle exec rspec`: 0 examples/26 erros de carregamento antes da correção, 135 examples/0 failures depois, sem tocar nenhum spec individual — a causa era só a declaração de group no `Gemfile`.

## Fonte do sistema ausente quebrava visualmente o espaçamento entre palavras

- **Data:** 2026-11-07
- **Severidade:** média
- **PR:** #39

### O que aconteceu

Testando as páginas novas num browser real, o texto renderizava com espaçamento enorme entre palavras (ex. "Esqueci   minha   senha", cada palavra visivelmente separada) — sem nenhuma propriedade CSS indicando o problema: `getComputedStyle` mostrava `wordSpacing: 0px`, `letterSpacing: normal`, `textAlign` correto, nada incomum.

### Causa raiz

O stack padrão do `font-sans` do Tailwind (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, ...`) não tem nenhuma dessas fontes instaladas neste WSL (`fc-list` só retorna DejaVu e Ubuntu Sans) — o Chromium cai pro fallback final da lista (fonte variável sem eixos `wght`/`wdth` padronizados), que nesta máquina renderiza com glifo de espaço anormalmente largo. Isso não aparece em nenhuma propriedade CSS computada porque é uma característica de renderização da fonte em si, não do CSS aplicado.

### Como foi encontrado

Captura de tela real do browser durante a verificação manual das páginas novas (a suíte automatizada do Vitest/jsdom não renderiza fonte de verdade, então nunca pegaria isso).

### Impacto

Qualquer página do projeto ficaria com esse espaçamento quebrado, dependendo só de quais fontes o sistema operacional/máquina de quem acessa tem instaladas — um problema que afetaria produção (qualquer visitante sem nenhuma das fontes do stack instalada) tanto quanto este ambiente de desenvolvimento, não é exclusivo deste WSL.

### Correção

Fonte Inter (`@fontsource-variable/inter`, self-hosted, licença OFL, sem requisição a serviço externo) adicionada como primeira opção do `--font-sans` via `@theme` do Tailwind (`app/frontend/entrypoints/application.css`), garantindo a mesma renderização independente da fonte instalada no sistema operacional de quem acessa.

### Verificação

Capturas de tela antes (espaçamento quebrado) e depois (texto normal) da correção, comparadas lado a lado durante a verificação manual.

## CI sem `RAILS_MASTER_KEY` pro job de teste

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #33

### O que aconteceu

O job `test` do CI (`.github/workflows/ci.yml`) passou a falhar com `ActiveRecord::Encryption::Errors::Configuration` depois da PR do 2FA ser aberta — o `otp_secret` do model `Admin` usa `encrypts` (Active Record Encryption), que precisa decriptar `config/credentials.yml.enc` em runtime, mesmo em ambiente de teste.

### Causa raiz

Até então, nenhum código do projeto dependia de decriptar credentials em runtime — só o `master.key` local era necessário pra editar credentials, nunca pra rodar a aplicação/testes. O CI nunca precisou da variável `RAILS_MASTER_KEY`, então ela nunca tinha sido configurada como secret do repositório.

### Como foi encontrado

CI da PR do 2FA (#32) falhando no job `test`, com o erro de configuração do Active Record Encryption no log.

### Impacto

Bloqueava completamente o CI de qualquer PR que precisasse rodar os testes depois da introdução do 2FA — nenhum merge seguro possível sem essa variável.

### Correção

Secret `RAILS_MASTER_KEY` criado no repositório GitHub (`gh secret set RAILS_MASTER_KEY < config/master.key`) e referenciado no `env` do job `test` em `.github/workflows/ci.yml`.

### Verificação

Confirmado pelo próprio CI: o job `test` voltou a passar depois da correção, no mesmo PR que a introduziu (isolado em PR própria, mergeado antes de reabrir/continuar a PR do 2FA).

## CVEs do Rails 8.1.4 (um crítico) sinalizados pelo bundler-audit

- **Data:** 2026-11-05
- **Severidade:** crítica
- **PR:** #36

### O que aconteceu

O job `scan_ruby` do CI começou a falhar numa PR de documentação (sem nenhuma mudança de código), sinalizando 14 vulnerabilidades no Rails 8.1.4 — a base de dados do `bundler-audit` (`ruby-advisory-db`) tinha sido atualizada com um lote de advisories novos pro Rails, incluindo uma crítica (`GHSA-f3w6-w445-fwh9`, leitura/escrita arbitrária de arquivo na análise de imagem do Active Storage) e uma alta (`GHSA-v924-7rp8-4mxh`, possível RCE em preview de vídeo).

### Causa raiz

Vulnerabilidade na própria versão do Rails usada pelo projeto (`8.1.4`), descoberta e divulgada depois do lançamento dessa versão — não é um erro de configuração do projeto, é uma dependência que ficou vulnerável com o tempo.

### Como foi encontrado

CI de uma PR não relacionada (documentação) falhando no job `scan_ruby`, deixando claro que o problema era pré-existente no `main`, não introduzido por essa PR.

### Impacto

Qualquer deploy rodando Rails 8.1.4 ficava exposto às vulnerabilidades listadas, a mais grave permitindo leitura/escrita arbitrária de arquivo via análise de imagem do Active Storage. Também bloqueava o CI de toda PR a partir daquele ponto (check obrigatório).

### Correção

`bundle update rails` (o `Gemfile` já fixa `~> 8.1.4`, que permite a atualização de patch) atualizando todas as gems do Rails pra `8.1.4.1`, versão que corrige todos os advisories listados.

### Verificação

`bin/bundler-audit` limpo (0 vulnerabilidades, eram 14) depois da atualização; `bin/brakeman`, `bundle exec rubocop` e `bundle exec rspec` (121 examples) confirmados limpos/verdes na mesma PR, pra garantir que o bump de patch não quebrou nada.
