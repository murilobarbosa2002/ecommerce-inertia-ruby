# 0013 - Autenticação de admin e audit logging

## Status

Aceito

## Contexto

`docs/adr/0010` já deixava isso pendente de propósito, na sua última linha: "quando autenticação/autorização forem implementadas de verdade... a escolha de biblioteca/estratégia é uma decisão de arquitetura própria (novo ADR)". Até este ADR, não existia nenhum model de conta, nenhuma rota de autenticação, nenhum mecanismo de audit log no projeto.

O mantenedor pediu explicitamente: conta de admin login-only (sem autocadastro público), rate limiting e bloqueio contra força bruta, 2FA obrigatório desde já (não opcional), e um log de auditoria que cubra tanto mudança de registro (CRUD) quanto evento de negócio que não é CRUD (login, bloqueio, etc. — "tudo deve ter log"). Cada escolha de biblioteca abaixo foi pesquisada via Context7/RubyGems antes de implementar, não assumida de memória.

## Decisão

**Autenticação**: sessão nativa do Rails 8, adaptada do gerador real `bin/rails generate authentication` (os templates reais do gem `railties` instalado foram lidos antes de adaptar, não reinventados do zero). Não adota Devise nem Rodauth — consistente com a preferência já fixada em `docs/adr/0005`/`0008`/`0009` por soluções nativas e de dependência mínima quando elas já resolvem o problema. Senha via `has_secure_password`/bcrypt (gem `bcrypt`, já estava comentada no `Gemfile` como placeholder padrão do Rails, só precisou ser descomentada).

**Conta login-only**: zero rota de autocadastro público. As únicas duas formas de criar uma conta de admin são (a) CLI interativa (`bin/rails admin:create`, senha digitada via `$stdin.getpass`, nunca como argumento de linha de comando — argumento de CLI vaza em histórico de shell e em `ps aux`, prompt mascarado não) ou (b) um admin já autenticado criando outro pelo painel.

**Rate limiting e bloqueio são dois mecanismos distintos, não um só**: rate limiting (força bruta por janela de tempo) usa o gem `rack-attack`, não o `rate_limit` nativo do Rails — rodar os dois juntos no mesmo endpoint seria redundante (duas configurações, dois lugares pra manter sincronizados, por um só endpoint). `rack-attack` foi escolhido porque cobre throttle por IP e por e-mail combinados na mesma camada, e porque esse mesmo mecanismo se estende depois pra todo o namespace `/admin` sem precisar de configuração repetida por controller. Bloqueio de conta (sticky, não expira por janela de tempo) é um estado persistente dela — vive em service objects dedicados, nunca em callback do `ActiveRecord` nem direto no controller (`docs/adr/0004`). A mensagem de erro de conta bloqueada é genérica, igual à de senha errada, pra nunca confirmar a um atacante que um e-mail específico existe no sistema ou está bloqueado.

**2FA via TOTP é obrigatório desde já**, não um "depois". Usa `rotp` + `rqrcode` — gems mínimos, sem opinião de persistência nem de UI, consistente com a decisão de não adotar um framework de autenticação completo só por esse recurso. Inclui códigos de recuperação de uso único: TOTP sem recuperação arrisca perda permanente de acesso se o admin perder o dispositivo autenticador.

**Audit logging é deliberadamente dividido em dois mecanismos que não são unificados em um só**, porque cobrem formatos de dado diferentes:

- **PaperTrail** para histórico de mudança de registro (CRUD) — escolhido sobre o gem Audited especificamente por suportar reverter um registro pro estado anterior nativamente (Audited não suporta isso). O trade-off aceito: o "exigir comentário explicativo" que o Audited tem de fábrica (`comment_required`) não existe no PaperTrail — por isso entra uma validação própria, construída por cima da opção `meta:` do PaperTrail, replicando esse comportamento.
- **Um model e serviço próprios** (`AuditEvent` + `AuditEvents::RecordAuditEvent`) para evento de negócio que não é mudança de registro — tentativa de login, bloqueio de conta, habilitar/desabilitar 2FA, uso de código de recuperação, etc. PaperTrail não cobre isso; forçar esses dois formatos (snapshot diferenciável de registro vs. fato pontual de negócio) num mecanismo só geraria mais complexidade do que separar.

**RBAC/permissão granular por papel configurável** foi confirmada como o formato desejado pelo mantenedor, mas é uma fase separada e posterior, com ADR próprio quando chegar. Por enquanto existe um único papel de admin, sem hierarquia — qualquer admin autenticado pode criar outro admin ou desbloquear uma conta. Isso é documentado aqui como estado intencional e temporário, não um esquecimento.

## Consequências

- Novas dependências diretas do projeto: `bcrypt`, `rack-attack`, `rotp`, `rqrcode`, `paper_trail` (este último entra num PR posterior desta mesma iniciativa, junto com o resto do audit log de CRUD).
- `otp_secret` é dado sensível e será armazenado com `encrypts` (Active Record Encryption, já exigido como padrão em `docs/adr/0010`) — isso exige `bin/rails db:encryption:init` ter sido executado antes de funcionar; é um pré-requisito de setup a documentar em `docs/environment-setup.md` quando a parte de 2FA for implementada.
- Reset de senha pro admin existente está dentro do escopo desta mesma iniciativa (PR posterior), usando o mecanismo nativo `generates_token_for` do Rails — sem gem nova pra isso.
- Enquanto não existir o painel admin de verdade (`docs/adr/0003` já estabelece que ele é 100% custom, ainda não existe nenhuma tela), a criação de admin pelo painel (opção "b" acima) fica só no backend/service, sem UI — a UI chega junto com o painel em si.
- Quando a fase de RBAC chegar, ela não reabre esta decisão — adiciona um novo ADR que referencia este, documentando o papel configurável por cima do único papel atual.
- **Pendências de backend que só fazem sentido resolver quando o frontend do painel existir** (PR de frontend desta mesma iniciativa — ver plano de implementação):
  - `AdminPanel::SessionsController#new` renderiza uma página Inertia (`Admin/Session/New`) que ainda não existe — rota funcional só de ponta a ponta quando essa página for criada.
  - `redirect_to ..., alert: ...` usa o flash nativo do Rails, mas nenhum controller deste projeto compartilha `flash` com o Inertia ainda (`InertiaController` só tem um exemplo comentado de `inertia_share` pra outro propósito). Sem isso, a mensagem genérica de "e-mail ou senha inválidos" nunca chegaria à UI real — o frontend precisa adicionar `inertia_share flash: -> { flash.to_hash }` (ou equivalente) e renderizar isso no componente de login.
  - Limites de caractere do lado do servidor já existem (e-mail até 254 caracteres, senha até 72 bytes via `has_secure_password`), mas o formulário real (Zod/RHF, `docs/adr/0012`) deve espelhar esses limites no cliente pra UX — o servidor continua sendo a autoridade de validação independente disso.
  - Verificação de XSS (nenhuma entrada do admin refletida sem escape) só é verificável de fato quando a página de login existir — React/Inertia escapa por padrão, mas isso deve ser confirmado na prática, não assumido.
