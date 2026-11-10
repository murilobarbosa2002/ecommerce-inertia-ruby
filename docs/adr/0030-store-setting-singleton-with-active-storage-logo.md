# 0030 - `StoreSetting` como singleton garantido no banco, com Active Storage pro logo

## Status

Aceito

## Contexto

O issuer mostrado no app autenticador ao configurar o 2FA (`TwoFactorsController#totp`) vinha de `request.host` — em desenvolvimento aparece como `localhost`, sem nenhum jeito de configurar o nome real da loja. Isso revelou uma necessidade mais ampla: um template white-label precisa de um lugar pra configurar a identidade da loja (nome, logo) que outras partes do sistema (2FA, e no futuro título de página, remetente de e-mail, etc.) possam consultar — não um campo isolado só pro TOTP.

Esse tipo de configuração é, por natureza, um singleton: só existe uma loja, nunca duas linhas concorrentes. Modelar isso só na camada de aplicação (ex. sempre buscar `first_or_create!` sem nenhuma garantia estrutural) deixaria uma janela de corrida real: duas requisições concorrentes chamando `first_or_create!` ao mesmo tempo, sem nenhuma linha ainda, podem ambas falhar em encontrar uma e tentar criar — o banco não tem nenhuma restrição que impeça a segunda criação.

Pro logo, o projeto já tinha a gem `activestorage` no `Gemfile`, com `config/storage.yml` e `config.active_storage.service` por ambiente já configurados (padrão do scaffold do Rails 8) — só faltavam as tabelas, nunca geradas porque nada no projeto usava upload ainda. Buscou-se via Context7 (`/websites/api_rubyonrails` e `/websites/guides_rubyonrails`) um validador nativo do Rails pra `content_type`/tamanho de um `has_one_attached`, sem achar uma referência definitiva de uma API assim no core — só gems de terceiros (ex. `active_storage_validations`) oferecem isso.

## Decisão

**Singleton garantido no banco, não só na aplicação.** `store_settings` ganha uma coluna `singleton_guard` (`boolean`, `default: true`, `null: false`) com `add_index ..., unique: true`. Como toda linha nasce com `singleton_guard: true`, o índice único torna uma segunda linha impossível no nível do banco — não depende de nenhuma lógica de aplicação lembrar de checar antes de inserir. `StoreSetting.instance` é `first || create!(...)`, não `first_or_create!`: não existe uma coluna natural de "find by" pra um singleton (não é "ache por nome X", é "ache a única linha que existe"), então separar os dois passos deixa a intenção explícita.

**Active Storage pro logo, sem gem nova.** A gem já estava disponível; só faltava rodar `active_storage:install` pra gerar as tabelas. Sem um validador nativo confirmado, a validação de `content_type`/tamanho do logo é um método customizado que lê `logo.content_type`/`logo.byte_size` direto no blob, em vez de assumir uma sintaxe de validador não confirmada por documentação atual.

**`change_reason` incondicional em `on: :update`.** `tracked_by_change_reason :name` só grava `change_reason` na versão quando `name` está entre os atributos que de fato mudaram (`object_changes`) — `logo` não é uma coluna, então nunca entra nesse diff. Active Storage ainda aciona um `touch` no registro pai ao anexar um arquivo (`touch: true` padrão da gem), o que gera uma versão "update" vazia via PaperTrail mesmo assim — mas se a validação de `change_reason` fosse condicionada a `name_changed?`, uma troca só de `logo` passaria sem exigir motivo nenhum (mesmo gap já corrigido em `RolePermission`, `#53`: `docs/adr/0021`). A validação de presença de `change_reason` em `StoreSetting` fica incondicional em `update`, cobrindo os dois casos (`name` e/ou `logo`) sempre.

**Permissão dedicada (`manage_store_settings`), sem ADR próprio.** Aplicação direta do modelo de RBAC já decidido em `docs/adr/0021` — mesmo racional que já valeu pra `#53` (gerenciar papéis), não é uma decisão de arquitetura nova.

## Consequências

- Nenhuma segunda linha de `store_settings` é possível, mesmo com um SQL direto no banco (fora da aplicação) — a garantia não depende de nenhum código Ruby.
- Trocar só o logo gera um `AuditEvent` (`store_settings_updated`) — mesmo a versão PaperTrail do `touch` automático (Active Storage) existindo nesse caso, ela não carrega `object_changes` (logo não é coluna), então o `AuditEvent` é o único rastro estruturado que diz qual campo mudou, mesma categoria de solução já usada pra `RolePermission`.
- A validação de `content_type`/tamanho do logo é código próprio do projeto, não delegada a uma gem de validação de attachment — se o projeto precisar de regras mais ricas no futuro (ex. dimensões de imagem), reavaliar se vale introduzir uma gem dedicada nesse momento, em vez de crescer esse método customizado indefinidamente.
- Qualquer configuração futura de "identidade da loja" (ex. remetente de e-mail, título de página) tem um lugar natural pra entrar: `StoreSetting`, não um novo singleton paralelo.
