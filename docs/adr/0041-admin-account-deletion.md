# 0041 - Exclusão de conta de admin

## Status

Aceito

## Contexto

`docs/adr/0021` previu a tela de gerenciar admins como listar/criar/editar — nunca excluir. Na prática, isso significa que não existe hoje nenhum jeito de remover uma conta `Admin` criada por engano ou que não serve mais, nem pela UI nem por rake task: o único recurso é editar, nunca apagar.

A restrição não é acidental: `audit_events` referencia `admin_id` sem `on_delete` configurado (RESTRICT implícito do Postgres), de propósito — qualquer tentativa de excluir um `Admin` com eventos de auditoria associados falha na constraint, protegendo o rastro de auditoria de se perder junto com a conta. Isso é correto como proteção, mas também significa que, sem mais nada, excluir um admin é simplesmente impossível, mesmo quando é exatamente o que se quer fazer (conta de teste, admin que saiu da operação, etc.).

A pergunta central: dá pra permitir excluir a conta sem perder o rastro de auditoria dela? Sim — o mesmo projeto já resolve esse problema para `performed_by_admin_id` (`on_delete: :nullify`, perde a referência ao admin mas o evento continua existindo, com tipo/data/metadata intactos). O mesmo padrão se aplica a `admin_id`.

## Decisão

**Banco:** `audit_events.admin_id` ganha `on_delete: :nullify` (migration trocando a FK existente), igual a `performed_by_admin_id`. `admin_sessions`/`admin_recovery_codes` já cascateiam via `dependent: :destroy` existente em `Admin`.

**Permissão:** `delete_admin`, própria — não reaproveita `manage_admins`. Quem pode criar/editar um admin não necessariamente pode excluir um; é a ação mais destrutiva (e menos reversível) da tela de gerenciar admins. Segue o precedente de `manage_store_settings`: não é concedida à role `owner` por padrão no seed, exige concessão deliberada pela tela de papéis — diferente de `reset_two_factor`/`view_audit_log`, que já vêm no `owner` desde o bootstrap.

**Guardas no `AdminsController#destroy`:**

- Nunca permite excluir a própria conta (mesma regra já aplicada a `reset_two_factor`: uma ação sobre outro admin, nunca sobre si mesmo).
- Nunca permite excluir o último admin com o papel `owner` — o painel não pode ficar sem nenhuma conta capaz de administrar a si mesma.
- Exige reautenticar com a senha atual antes de excluir, mesmo nível de proteção que desativar o próprio 2FA já tem (`AdminPanel::TwoFactorsController#destroy`) — a ação mais destrutiva do painel ganha a mesma fricção deliberada.
- `change_reason` continua obrigatório (já é incondicional em todo `destroy` de `Admin`, via `ChangeReasonRequired`).

**Auditoria:** um `AuditEvent` do tipo `admin_deleted` é registrado *antes* do destroy (`admin:` apontando pro alvo, `performed_by_admin:` quem excluiu), com e-mail e nome do papel do admin excluído salvos em `metadata` — depois do destroy, `admin_id` desse e de todo evento histórico daquela conta vira nulo (efeito do `on_delete: :nullify`), então a `metadata` é o único jeito de a tela de auditoria continuar identificando de quem era o evento.

**UI:** botão "Excluir" nas ações da linha (menu suspenso no desktop, botão direto no Drawer mobile — mesmo padrão já usado por "Resetar 2FA"), condicionado à permissão e a não ser a própria conta. Abre um `Dialog` (não `ConfirmDialog`, que não aceita conteúdo arbitrário por contrato) com um formulário Zod + React Hook Form pedindo senha atual e motivo.

## Consequências

- Excluir um admin deixa de ser impossível, mas continua sendo a ação mais protegida do painel: permissão própria (não concedida por padrão), bloqueio de autoexclusão, bloqueio do último `owner`, reautenticação por senha e motivo obrigatório — nenhuma dessas guardas dispensa as outras.
- O histórico de auditoria de uma conta excluída sobrevive à exclusão (eventos continuam existindo, só sem a associação `admin`) — consistente com a mesma garantia que `performed_by_admin_id` já oferece desde antes.
- A tela de auditoria (e o feed do dashboard) precisam tratar um evento com `admin` nulo mas `metadata` preenchida como um caso de exibição normal, não um erro — mesmo recurso que `login_failed` já usa pra um e-mail sem conta correspondente.
- Qualquer tela futura que também referencie `Admin` por uma FK sem `on_delete` configurado herda a mesma limitação que `audit_events.admin_id` tinha até aqui — vale revisitar caso a caso se outra tela algum dia depender de excluir um admin que tenha registros lá.
