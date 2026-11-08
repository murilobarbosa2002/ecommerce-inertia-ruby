# Não lançado

Entradas acumuladas aqui até a primeira versão (`v0.1.0`) ser fechada, quando este conteúdo migra para `docs/changelog/v0.1.0.md`. Ver `CHANGELOG.md` para o índice de versões e `docs/adr/0016-changelog-root-index-with-release-files.md` para o porquê deste formato.

## Adicionado

- Conta de admin login-only, sem rota de autocadastro público: criada via CLI (`bin/rails admin:create`, senha digitada por prompt mascarado, nunca como argumento de linha de comando) ou por um admin já autenticado.
- Senha de admin armazenada com hash (`has_secure_password`/bcrypt), nunca em texto puro.
- Sessão de admin nativa do Rails, com login e logout.
- Rate limiting no login por IP e por e-mail, pra dificultar força bruta.
- Bloqueio de conta depois de 5 tentativas de senha erradas, com expiração automática em 15 minutos.
- Mensagem de erro genérica (senha errada / conta bloqueada) pra nunca revelar a um atacante se uma conta específica existe ou está bloqueada.
- Log de auditoria de eventos de negócio não ligados a mudança de registro: login, logout, bloqueio e desbloqueio de conta, habilitar/desabilitar 2FA, verificação de 2FA, uso de código de recuperação, solicitação e conclusão de reset de senha.
- Reset de senha de admin via link assinado enviado por e-mail, expirando em 15 minutos; mensagem de "e-mail enviado" genérica independente de a conta existir, pra não revelar existência de conta.
- Rate limiting também no endpoint de solicitar reset de senha, pra evitar spam de e-mail/enumeração de contas.
- Autenticação de dois fatores (TOTP) obrigatória: QR code pra configurar um app autenticador (Google Authenticator, Authy, ou qualquer app compatível com TOTP), com 10 códigos de recuperação de uso único gerados na ativação.
- Ativar 2FA exige confirmar um código válido do app autenticador antes de se tornar obrigatório; desativar 2FA exige reautenticação com a senha atual.
- Locale padrão `pt-BR`, incluindo as mensagens de validação que o próprio framework gera (via `rails-i18n`); conteúdo de produto e conteúdo de ferramentas internas de linha de comando organizados em arquivos de I18n separados.
- Log de auditoria de mudança de registro (CRUD): toda alteração ou exclusão do e-mail de um admin exige um motivo explícito, guardado junto da versão; histórico de versões permite reverter o registro pro estado anterior.
- Telas de login, verificação de dois fatores e reset de senha do admin (primeiras páginas reais do painel), com validação de formulário (Zod + React Hook Form) e mensagens traduzidas (pt-BR via i18next).
- Controle de acesso por papel (RBAC): cada admin tem um papel (`Role`) com um conjunto de permissões configurável, em vez de acesso irrestrito pra qualquer admin autenticado. `bin/rails admin:create` passa a exigir que o banco já tenha sido inicializado (`bin/rails db:seed`) antes de criar o primeiro admin.
- Primeira tela do painel autenticado (dashboard, ainda placeholder), com navegação própria (marca, alternância de tema, sair) — a raiz do site (`/`) passa a mostrar essa tela pro admin logado, em vez de só redirecionar pro login.

## Corrigido

- Logout do admin passou a gerar evento de auditoria (antes não era registrado).
- Verificação de 2FA no login passou a respeitar o bloqueio de conta (antes, um código correto contornava o bloqueio mesmo com a conta bloqueada).
- Desativar 2FA com a senha atual errada passou a contar para o limite de 5 tentativas da conta (antes era ilimitado).
- Revisitar a tela de configuração do 2FA deixou de sobrescrever o secret já ativo, o que podia travar o login do próprio admin.
- Unicidade de e-mail do admin passou a ignorar diferença de maiúsculas/minúsculas.
- Atualização do Rails para `8.1.4.1`, corrigindo múltiplos CVEs (um crítico, de leitura/escrita arbitrária de arquivo) divulgados após o lançamento do `8.1.4`.

## Alterado

- Eventos de auditoria de login foram divididos em `password_verified`/`login_succeeded`/`reauthentication_failed` para maior precisão (antes, contextos diferentes — senha certa mas 2FA pendente, reautenticação pra desativar 2FA — compartilhavam o mesmo `event_type` que outra situação já usava).
- A raiz do site (`/`) deixou de exibir a página de exemplo padrão do Inertia Rails e passou a redirecionar para o login do admin, único fluxo real disponível até a loja/painel existirem.
