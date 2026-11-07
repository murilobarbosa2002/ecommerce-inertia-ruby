# 0021 - Modelo de RBAC: Role com permissões configuráveis

## Status

Aceito

## Contexto

`docs/adr/0013` deliberadamente deixou RBAC pra depois: hoje qualquer `Admin` autenticado tem acesso irrestrito (inclusive pra criar outro admin), sem nenhum conceito de papel ou permissão. Isso valia pra autenticação sozinha, mas deixa de valer assim que o painel ganha telas reais (gerenciar admins, configurações) — sem RBAC, não há como restringir quem pode fazer o quê.

A decisão de produto já fixada é: permissão nunca é atribuída direto a um `Admin` — ela pertence a um papel (`Role`), configurável, e o `Admin` pertence a um `Role`. Restava decidir como as permissões de cada `Role` são armazenadas: uma lista simples (array/jsonb) direto na linha do `Role`, ou um model/tabela `Permission` própria relacionada por uma tabela de junção.

Optou-se pela segunda: o projeto é um template que vai crescer (mais telas, mais ações restritas) — tratar `Permission` como registro de primeira classe desde já evita uma segunda migração de dado quando isso deixar de ser hipotético, e permite no futuro listar as permissões disponíveis direto do banco (pra uma tela de configurar `Role`), não de uma constante Ruby hardcoded.

## Decisão

Três tabelas: `roles` (`name`, único), `permissions` (`key`, único, estável, referenciado no código — nunca o id numérico; `description`, pra uma futura UI explicar o que cada permissão libera), e `role_permissions` (tabela de junção simples, `role_id` + `permission_id`, índice único no par). `Admin belongs_to :role` (obrigatório — todo admin tem exatamente um papel, nunca zero).

`Role#permission?(key)` é a única API que o resto do código usa pra checar permissão (`role.permission?(:manage_admins)`), nunca uma query direto em `role_permissions`/`permissions` espalhada pelo projeto.

`AdminPanel::Authorization` (`app/controllers/concerns/admin_panel/authorization.rb`), incluído em `AdminPanel::BaseController` ao lado de `AdminPanel::Authentication`, expõe `require_permission(:chave)` como macro de classe — um controller declara a permissão exigida no topo, igual a como `allow_unauthenticated_admin_access` já funciona pra autenticação. Resposta padrão pra quem não tem a permissão é `403` puro por enquanto; a API exata (redirect com flash, página própria) fica pra quando o painel (Fase 5) tiver uma tela de verdade pra redirecionar.

Role inicial: `owner`, com a permissão `manage_admins` — seedada em `db/seeds.rb` (bug real documentado em `docs/bugs/infrastructure.md`: um dado assim só dentro de uma migration não existe num banco bootstrapado via `db:schema:load`). `bin/rails admin:create` sempre atribui `owner` ao admin criado — não há ainda interface pra escolher outro papel na criação via CLI, isso é suficiente pro único fluxo de bootstrap que existe hoje.

## Consequências

- Duas tabelas a mais (`permissions`, `role_permissions`) e uma camada de indireção (`Role` → `role_permissions` → `Permission`) comparado a um array no `Role` — aceito deliberadamente, porque `Permission` como registro de banco é o que permite uma tela de configuração de papel ler as permissões disponíveis dinamicamente, sem hardcode.
- Toda checagem de permissão no código referencia a `key` (string estável), nunca o `id` — renomear/reordenar registros no banco não quebra nenhum `require_permission(:chave)` existente.
- `require_permission` ainda não tem nenhum consumidor real (nenhum controller do painel existe ainda) — primeiro uso real é a tela de gerenciar admins (Fase 5, PR seguinte), que também é quando a resposta de "sem permissão" ganha tratamento de UI de verdade em vez de `403` puro.
- `Admin#role` obrigatório significa que toda criação de admin (CLI hoje, UI na Fase 5) precisa de uma role válida antes — sem isso, falha na validação, não silenciosamente.
