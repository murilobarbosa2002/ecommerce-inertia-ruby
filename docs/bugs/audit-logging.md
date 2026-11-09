# Bugs: audit logging

Bugs relacionados a `AuditEvent`, PaperTrail e à precisão/cobertura do log de auditoria. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Exigir `change_reason` em todo update do `Admin` quebrava ~35 specs de serviços internos

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #38

### O que aconteceu

A primeira versão do concern `ChangeReasonRequired` exigia `change_reason` em qualquer `update!` do model `Admin`, sem distinguir o tipo de alteração. Rodar a suíte completa quebrou 35 specs — todo serviço interno que faz `admin.update!(...)` como parte de um fluxo automático (resetar tentativas de login, bloquear/desbloquear conta, girar o secret do 2FA) parou de funcionar, porque nenhum desses pontos tinha (ou deveria ter) um "motivo" humano pra fornecer.

### Causa raiz

Confusão de responsabilidade entre os dois mecanismos de audit log que a `docs/adr/0013` deliberadamente mantém separados: PaperTrail é para mudança **editorial** de registro (um admin decide mudar um dado de outro admin), `AuditEvent` é para **evento de negócio automático** (login, bloqueio, 2FA). Aplicar `has_paper_trail`/`change_reason` a todo atributo do `Admin` tratava esses dois tipos de mudança como a mesma coisa, forçando uma justificativa humana em transições que o próprio sistema já explica via `AuditEvent`.

### Como foi encontrado

Rodando a suíte completa (`bundle exec rspec`) depois de implementar a primeira versão do concern — 35 falhas, todas com a mesma mensagem (`A validação falhou: Motivo da alteração não pode ficar em branco`) em serviços que nunca tinham relação com edição editorial do registro.

### Impacto

Sem a correção, qualquer fluxo automático que atualiza o `Admin` (login, bloqueio, 2FA) ficaria completamente quebrado em produção — a aplicação não conseguiria resetar tentativas de login nem desbloquear conta, por exemplo, porque o `update!` interno sempre falharia por falta de `change_reason`.

### Correção

`tracked_by_change_reason(*attributes)` (novo método de classe do concern) usa a opção `only:` do PaperTrail — só os atributos explicitamente listados (hoje, só `email_address`) geram versão — e condiciona a validação de presença de `change_reason` em update a `if: -> { atributo_rastreado_changed? }`. Um update que não toca nenhum atributo rastreado não exige `change_reason` nem cria versão, preservando o `AuditEvent` como único registro desses casos.

### Verificação

Suíte completa: 35 falhas antes da correção (listadas no diff da implementação), 0 falhas depois. Specs dedicados em `spec/models/admin_spec.rb` cobrindo os dois lados: update em `email_address` sem `change_reason` é inválido; update em `failed_login_attempts` sem `change_reason` passa normalmente e não cria versão.

## PaperTrail falhava com `Psych::DisallowedClass` ao reverter uma versão

- **Data:** 2026-11-07
- **Severidade:** alta
- **PR:** #38

### O que aconteceu

`admin.paper_trail.previous_version` (usado pra reverter um registro pra como estava antes) levantava `Psych::DisallowedClass: Tried to load unspecified class: ActiveSupport::TimeWithZone` ao tentar desserializar a versão salva.

### Causa raiz

PaperTrail serializa as colunas `object`/`object_changes` em YAML por padrão. Rails >= 7 carrega essas colunas com `YAML.safe_load`, que só permite desserializar as classes explicitamente listadas em `ActiveRecord.yaml_column_permitted_classes` — por padrão, essa lista está vazia. Qualquer atributo `datetime` do registro versionado (ex. `created_at`/`updated_at`) é desserializado como `ActiveSupport::TimeWithZone`, que não está na lista por padrão.

### Como foi encontrado

Escrevendo o spec "permite reverter pra versão anterior do email_address" — a chamada a `admin.paper_trail.previous_version` falhava com a exceção, mesmo com a versão salva corretamente no banco.

### Impacto

A funcionalidade de reverter um registro — motivo explícito, documentado na `docs/adr/0013`, de escolher PaperTrail sobre o Audited — não funcionava de verdade pra nenhum model com atributo `datetime`, o que inclui praticamente qualquer `ActiveRecord::Base` (todos têm `created_at`/`updated_at`).

### Correção

`config/initializers/paper_trail.rb` configura `ActiveRecord.yaml_column_permitted_classes` com a lista recomendada pela própria documentação do PaperTrail (`ActiveRecord::Type::Time::Value`, `ActiveSupport::TimeWithZone`, `ActiveSupport::TimeZone`, `BigDecimal`, `Date`, `Symbol`, `Time`).

### Verificação

Confirmado removendo o initializer de propósito e vendo o spec de reversão falhar com `Psych::DisallowedClass`, depois restaurando e vendo o spec passar.

## Logout do admin não gerava evento de auditoria

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #30

### O que aconteceu

`AdminPanel::SessionsController#destroy` (logout) destruía a `AdminSession` sem registrar nenhum `AuditEvent`, deixando o log de auditoria sem o fim do ciclo de vida da sessão — só login e eventos de bloqueio/2FA eram registrados.

### Causa raiz

O audit log de eventos de negócio (PR #26) foi implementado e integrado ao login e ao fluxo de bloqueio antes do controller de sessão existir de fato (PR #28); a ação de logout não foi revisitada para incluir o evento correspondente quando foi implementada.

### Como foi encontrado

Revisão própria do audit log depois do login/logout estarem implementados, perguntando explicitamente "tudo que deveria ter log e ser auditável está sendo?".

### Impacto

Lacuna de rastreabilidade: não era possível reconstruir pelo audit log quando uma sessão de admin terminou por logout explícito (só login/bloqueio apareciam), prejudicando qualquer investigação de segurança que dependesse da auditoria.

### Correção

`SessionsController#destroy` passou a chamar `AuditEvents::RecordAuditEvent` com `event_type: :logout` antes de destruir a sessão.

### Verificação

Spec cobrindo que o logout gera exatamente um `AuditEvent` do tipo `logout`. Confirmado removendo a chamada de propósito e vendo o spec falhar antes de restaurar a correção.

## `login_failed` reusado entre login normal e reautenticação pra desativar 2FA

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #32

### O que aconteceu

`AdminAuthentication::RecordFailedLoginAttempt` sempre registrava `event_type: :login_failed`, mesmo quando era chamado a partir de `TwoFactorsController#destroy` (senha errada ao tentar desativar o 2FA) — um contexto completamente diferente de "senha errada na tela de login".

### Causa raiz

O serviço foi desenhado originalmente só pro fluxo de login; quando a reautenticação de desativar 2FA passou a reusá-lo (pra ganhar o mesmo bloqueio de 5 tentativas, ver `docs/bugs/two-factor-authentication.md`), o `event_type` fixo foi reaproveitado sem revisão.

### Como foi encontrado

Revisão própria de precisão do audit log: ao listar os `event_type` existentes e os contextos que os disparam, ficou claro que dois fluxos de negócio diferentes (senha errada no login vs. senha errada reautenticando pra desativar 2FA) produziam o mesmo rótulo no log, impossível de distinguir depois só pelo `AuditEvent`.

### Impacto

Log de auditoria impreciso — não é uma falha de segurança em si (o bloqueio funciona do mesmo jeito), mas compromete qualquer investigação que precise diferenciar "alguém tentando entrar com a senha errada" de "um admin autenticado tentando desativar 2FA com a senha errada".

### Correção

`RecordFailedLoginAttempt` ganhou um parâmetro `event_type:` (default `:login_failed`, preservando o comportamento do login); `TwoFactorsController#destroy` passou a chamar com `event_type: :reauthentication_failed`, um valor novo no enum `AuditEvent`.

### Verificação

Spec "registra reauthentication_failed (não login_failed) com senha atual errada": confirma o `event_type` exato do `AuditEvent` gerado. Confirmado quebrando o parâmetro de propósito (voltando ao default fixo) e vendo o spec falhar antes de restaurar a correção.

## `login_succeeded` disparado antes da conclusão real do login com 2FA pendente

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #32

### O que aconteceu

`AdminAuthentication::AuthenticateWithPassword` registrava `event_type: :login_succeeded` só por validar a senha corretamente — mesmo quando a conta tinha 2FA ativo e o login ainda estava pendente de verificação do segundo fator, sem nenhuma `AdminSession` real criada ainda.

### Causa raiz

O evento de sucesso foi desenhado pensando só no fluxo sem 2FA (senha certa = login completo); quando o 2FA foi introduzido como uma etapa adicional, o ponto onde "login" de fato se completa mudou, mas o audit log não acompanhou essa mudança.

### Como foi encontrado

Mesma revisão de precisão do audit log que encontrou o bug anterior: o log mostrava `login_succeeded` em um momento em que a sessão de admin ainda não existia e uma segunda etapa (2FA) ainda podia falhar — um log enganoso, parecendo login completo sem ter completado.

### Impacto

Log de auditoria enganoso: uma tentativa de login que falhasse na etapa de 2FA (código errado, sessão pendente expirada) já tinha registrado `login_succeeded` antes disso, dando a impressão de que o login foi bem-sucedido quando não foi.

### Correção

O sucesso de senha passou a registrar `event_type: :password_verified` (um fato novo e mais preciso: "a senha estava correta", não "o login terminou"). `login_succeeded` passou a ser registrado só nos pontos reais de criação de sessão: no login sem 2FA (`SessionsController#create`) e na conclusão da verificação de 2FA (`TwoFactorAuthenticationsController#create`).

### Verificação

Specs cobrindo os dois fluxos (`registra two_factor_verified e login_succeeded com código TOTP válido`, `registra recovery_code_used e login_succeeded com código de recuperação válido`) confirmam exatamente dois eventos por login completo com 2FA, nos nomes certos. Confirmado revertendo a mudança de propósito (voltando `login_succeeded` pro ponto antigo) e vendo os specs falharem antes de restaurar a correção.

## Trocar o papel de um admin não gerava nenhum registro de auditoria

- **Data:** 2026-11-09
- **Severidade:** alta
- **PR:** #50

### O que aconteceu

`AdminsController#update` sempre permitiu trocar o `role_id` de um admin (tela de editar, `docs/adr/0021`), mas nenhuma troca de papel gerava versão no PaperTrail nem exigia `change_reason` — só `email_address` era rastreado. Confirmado empiricamente: trocar o `role_id` de um admin numa transação de teste não incrementava `admin.versions.count`.

### Causa raiz

`Admin` chama `tracked_by_change_reason :email_address` (`app/models/concerns/change_reason_required.rb`), que usa a opção `only:` do PaperTrail — só os atributos explicitamente listados ali viram versão ou exigem motivo. `role_id` nunca foi adicionado a essa lista desde que o modelo de RBAC (`docs/adr/0021`) introduziu o campo, mesmo a tela de editar admin (PR que seguiu depois) já permitindo trocá-lo.

### Como foi encontrado

Revisão deliberada de "tudo que deveria ser auditável no projeto até agora está sendo auditado de fato?", percorrendo cada model/controller que muda estado e comparando contra o que o `AuditEvent`/PaperTrail de fato cobre — não um teste automatizado pegando, nem um erro visível na aplicação.

### Impacto

Trocar o papel de um admin é uma mudança de **permissão**, não um detalhe cosmético — é exatamente o tipo de ação que mais precisa de rastro (quem promoveu/rebaixou quem, quando, por quê). Sem isso, essa mudança ficava completamente invisível no histórico, mesmo o projeto já tendo infraestrutura de auditoria pronta pra esse exato caso (o mesmo mecanismo já usado pra `email_address`).

### Correção

`tracked_by_change_reason :email_address, :role_id` — mesma infraestrutura já existente, só a lista de atributos rastreados mudou. Trocar o papel passa a exigir `change_reason` (mesma validação condicional já usada pra `email_address`) e gera versão no PaperTrail.

### Verificação

Dois specs novos em `spec/requests/admin/admins_spec.rb` ("atualiza o papel com motivo, registrando versão no PaperTrail", "não atualiza e redireciona de volta sem motivo quando o papel muda") confirmados vermelhos antes da correção (nenhuma versão criada; troca de papel passava sem motivo nenhum) e verdes depois.
