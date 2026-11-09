# 0024 - AuditEvent distingue quem agiu de quem é o evento

## Status

Aceito

## Contexto

`docs/adr/0013` criou `AuditEvent` com um único relacionamento `admin`, suficiente até agora porque toda ação registrada era de auto-serviço: o próprio admin agindo na própria conta (login, habilitar/desabilitar 2FA, trocar a própria senha). Nesses casos, "de quem é o evento" e "quem agiu" são sempre a mesma pessoa, então um campo só bastava.

A funcionalidade de resetar o 2FA de outro admin (permissão `reset_two_factor`, concedida através da tela de papéis de `docs/adr/0021`) quebra essa suposição: quem perde o 2FA (o sujeito do evento) não é quem decide resetar (o ator). Reaproveitar o único campo `admin` existente obrigaria escolher entre apagar "quem perdeu o 2FA" ou "quem forçou o reset" — as duas informações importam, e nenhuma delas é derivável da outra depois do fato. O mesmo formato de problema volta a aparecer na funcionalidade de personificação de admin (impersonation, fase seguinte do RBAC), que precisa registrar os dois admins envolvidos (quem personificou, quem foi personificado) — resolver isso agora, de forma genérica, evita decidir a mesma coisa de novo, de um jeito possivelmente diferente, quando a personificação chegar.

Alternativas consideradas:

- **Guardar o ator em `metadata` (JSON)**, só no call site que precisar (ex. resetar 2FA passaria `metadata: { performed_by_admin_id: ... }`). Descartada: não é estruturado nem pesquisável como uma coluna/associação de verdade (não dá pra fazer `AuditEvent.where(performed_by_admin: x)`), e cada PR futura que precisar da mesma distinção (personificação) teria que lembrar de reimplementar isso do zero, sem garantia de ficar consistente com o que já existe.
- **Resolver só dentro da PR que introduziu o problema, ad-hoc**, deixando o caso geral pra quando a personificação chegar. Descartada: o padrão (um admin agindo sobre outro) já é conhecido antecipadamente; esperar geraria duas soluções divergentes pro mesmo problema no espaço de poucas PRs.

## Decisão

`AuditEvent` ganha uma segunda associação, `performed_by_admin` (`belongs_to`, `optional: true`, FK nilable `performed_by_admin_id` pra `admins`, `on_delete: :nullify` — mesmo racional já previsto pra `admin_id` numa limpeza futura de hard-delete de admin). `admin` continua sendo de quem é o evento (o sujeito); `performed_by_admin` é quem realizou a ação (o ator).

`performed_by_admin` é preenchido automaticamente por `AuditEvents::RecordAuditEvent`, lendo `Current.admin` (`ActiveSupport::CurrentAttributes`) — nunca passado manualmente por quem chama o service. Isso espelha exatamente como `whodunnit` do PaperTrail já funciona (`AdminPanel::BaseController#user_for_paper_trail`, lendo o mesmo `Current.admin`): nenhum call site precisa lembrar de passar o ator, e um mecanismo central automático não tem como ser esquecido PR a PR.

Três casos resultam desse preenchimento automático, sem nenhum código condicional no service:

- **Ação de auto-serviço** (ex. desabilitar o próprio 2FA): `Current.admin` é o mesmo registro passado como `admin:` — os dois campos coincidem, sem caso especial.
- **Ação sobre outro admin** (ex. resetar o 2FA de alguém com `reset_two_factor`): `Current.admin` é quem está autenticado fazendo a ação, distinto do `admin:` passado (o alvo).
- **Contexto sem request** (ex. rake task de fallback, acesso de shell): não existe `Current.admin`, `performed_by_admin` fica `nil` — correto, não há ator autenticado nesse caso, mesmo racional já aceito pra `bin/rails admin:create` não gerar nenhum rastro de "quem" além do próprio acesso de shell.

## Consequências

- Toda consulta futura de auditoria que precisar saber "quem fez isso com a conta de quem" tem os dois lados estruturados (`admin`/`performed_by_admin`), sem precisar inferir a partir de outro campo nem parsear `metadata`.
- Nenhum call site existente de `AuditEvents::RecordAuditEvent` precisou mudar — o preenchimento é automático e aditivo; os eventos de auto-serviço já existentes passam a ter `performed_by_admin` preenchido pela primeira vez, sempre igual ao próprio `admin`.
- A funcionalidade de personificação de admin (fase seguinte) reusa esse mesmo campo (`performed_by_admin` = quem personificou, `admin` = quem foi personificado) em vez de abrir uma decisão nova.
- Quando o hard-delete de admin existir (fase seguinte do RBAC, ver `docs/adr/0021`), `performed_by_admin_id` já está pronto pra isso (`on_delete: :nullify`) — só `admin_id` (FK implícita, sem essa opção ainda) precisa de ajuste nessa ocasião.
