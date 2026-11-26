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
- Primeira tela do painel autenticado (dashboard), com navegação própria (marca, alternância de tema, sair) — a raiz do site (`/`) passa a mostrar essa tela pro admin logado, em vez de só redirecionar pro login.
- Tela de gerenciar admins (listar, criar e editar), restrita a quem tem a permissão correspondente no papel — criar um admin pede motivo da criação (auditável) e tem um gerador de senha aleatória configurável (maiúsculas, números, caracteres especiais, quantidade de caracteres), com botão de copiar.
- Telas de configurar o 2FA (QR code + confirmação do app autenticador) e de códigos de recuperação, e tela de perfil do admin (trocar a senha, ver status do 2FA e desativá-lo). Os códigos de recuperação podem ser baixados como `.txt` ou como imagem, além de aparecerem na tela.
- Tela de gerenciar papéis (listar, criar e editar), restrita a quem tem a permissão correspondente — cada papel tem um nome e um conjunto de permissões configurável por checkbox; criar ou editar um papel pede motivo da alteração (auditável), inclusive quando só a lista de permissões muda, sem renomear o papel.
- Resetar o 2FA de outro admin (tela de gerenciar admins), restrito a quem tem a permissão `reset_two_factor` — fluxo de recuperação pra quando um admin perde o autenticador e os códigos de recuperação ao mesmo tempo; nunca permite resetar o próprio 2FA por essa tela. `bin/rails admin:disable_two_factor[email]` existe como último recurso (acesso de shell) pro caso em que nem isso resolve.
- Tela de configurações da loja (nome e logo), restrita a quem tem a permissão `manage_store_settings` — qualquer alteração (nome e/ou logo) pede motivo e gera evento de auditoria.
- Dashboard com números gerais (total de admins, quantos estão sem 2FA ativo, quantas contas estão bloqueadas no momento), feed de atividade recente (bloqueio/desbloqueio de conta, alteração de configurações da loja) restrito a quem tem a permissão `view_audit_log`, com filtro por tipo de evento e por intervalo de data/hora, e paginação.
- Atalhos personalizáveis no dashboard ("novo admin", "novo papel", "configurações da loja") — cada admin escolhe quais ver, filtrado sempre pelas permissões que tem no momento.
- Conta de admin passa a ter nome e sobrenome (obrigatórios) e celular (opcional) — exibidos na lista de admins e editáveis nas telas de criar/editar, com o mesmo rastro de auditoria (motivo + histórico de versões) já existente pra e-mail e papel.
- Busca (por nome, e-mail ou papel, no caso de Admins; por nome, no caso de Papéis) e ordenação por coluna nas telas de gerenciar Admins e Papéis.
- Tela de log de auditoria completo (todo evento, não só o resumo do dashboard), restrita a quem tem a permissão `view_audit_log` — busca por e-mail, filtro por tipo de evento (múltiplo, com busca) e por usuário (múltiplo, com busca), período, ordenação por data e paginação. A coluna de usuário mostra o papel junto do e-mail, e, quando não há usuário identificado (ex. tentativa de login com e-mail inexistente), mostra o IP de quem tentou; o evento de login falhado mostra quantas tentativas faltam antes do bloqueio da conta.

## Corrigido

- Atualização do servidor de aplicação Puma para `8.0.4`, corrigindo duas vulnerabilidades da `8.0.3` (esgotamento de memória em conexões SSL e parser que permitia alterar o caminho e a query string da requisição, contornando regras de proxy).
- Atualização do Ruby para `4.0.10`, corrigindo uma vulnerabilidade crítica de execução remota de código (CVE-2026-132825) presente na `4.0.9`, do `net-ssh` (dependência do Kamal) para `7.3.10`, corrigindo duas vulnerabilidades (validação de host key revogada e verificação de certificado TLS desligada em proxy HTTPS), e do Brakeman para `8.1.1` (o scan de segurança do CI exige sempre a versão mais recente).
- Um comentário mal-formado no layout fazia texto interno de documentação vazar pra página renderizada e impedia o tema escuro de ser aplicado antes do primeiro paint (causava um flash do tema claro).
- Logout do admin passou a gerar evento de auditoria (antes não era registrado).
- Verificação de 2FA no login passou a respeitar o bloqueio de conta (antes, um código correto contornava o bloqueio mesmo com a conta bloqueada).
- Desativar 2FA com a senha atual errada passou a contar para o limite de 5 tentativas da conta (antes era ilimitado).
- Revisitar a tela de configuração do 2FA deixou de sobrescrever o secret já ativo, o que podia travar o login do próprio admin.
- Unicidade de e-mail do admin passou a ignorar diferença de maiúsculas/minúsculas.
- Atualização do Rails para `8.1.4.1`, corrigindo múltiplos CVEs (um crítico, de leitura/escrita arbitrária de arquivo) divulgados após o lançamento do `8.1.4`.
- Trocar o papel de um admin passou a exigir motivo explícito e gerar versão no histórico, igual à troca de e-mail (antes não deixava nenhum registro).
- O tooltip do botão de recolher/expandir o menu lateral (e dos itens de navegação recolhidos) podia ficar preso na tela ou reaparecer num flash rápido ao alternar o menu com o mouse ainda em cima do botão, em vez de fechar normalmente.
- Uma barra de rolagem horizontal aparecia por um instante dentro do menu lateral ao expandi-lo.
- As animações de entrada do dashboard e de abrir/fechar de popover e modal passam a respeitar a preferência de movimento reduzido do sistema operacional.
- O menu da conta (topo do painel) passa a mostrar o nome do admin logado, além do e-mail e do papel; o avatar usa as iniciais do nome, não mais do e-mail. Nome e e-mail truncados (muito longos) mostram o texto completo num tooltip ao passar o mouse.
- Tooltips (ex. os da sidebar recolhida) passam a ter animação de entrada/saída, igual a popover e modal.
- Confirmar a senha ou desbloquear a própria conta (etapas intermediárias do login) passam a registrar o próprio admin como quem realizou a ação no log de auditoria (antes ficava sempre em branco, mesmo sendo sempre auto-serviço).

## Alterado

- Painel admin com novo layout: menu lateral (recolhível pra só ícones, preferência lembrada no navegador) agrupado por seção, com o item da página atual destacado e só os itens que o papel do admin permite; barra superior com breadcrumb, alternância de tema e menu da conta (e-mail, papel, perfil e sair); no celular o menu abre como gaveta lateral. O nome e o logo da loja aparecem na marca do menu. A navegação entre telas deixou de recarregar a página inteira.
- Botões do painel admin ganharam novo visual (cor de marca violeta-índigo, cantos e altura revisados, anel de foco mais visível) e novas variantes (secundário, contorno, perigo), tamanhos e estado de carregamento. Botões de envio de formulário continuam ocupando a largura toda.
- O issuer mostrado no app autenticador ao configurar o 2FA passa a usar o nome configurado da loja, em vez do host da requisição (ex. `localhost` em desenvolvimento).
- Eventos de auditoria de login foram divididos em `password_verified`/`login_succeeded`/`reauthentication_failed` para maior precisão (antes, contextos diferentes — senha certa mas 2FA pendente, reautenticação pra desativar 2FA — compartilhavam o mesmo `event_type` que outra situação já usava).
- A raiz do site (`/`) deixou de exibir a página de exemplo padrão do Inertia Rails e passou a redirecionar para o login do admin, único fluxo real disponível até a loja/painel existirem.
- A obrigatoriedade do 2FA pra conta admin passa a ter efeito de verdade: criar conta/logar continuam funcionando sem o 2FA ativo, mas qualquer outra ação no painel fica bloqueada até ativar — um aviso aparece assim que o admin loga, explicando o motivo e levando direto pra tela de configurar. Trocar a senha pela tela de perfil desloga todas as sessões ativas da conta, igual ao fluxo de redefinir senha por e-mail.
- As permissões `reset_two_factor` e `view_audit_log` passam a vir no papel `owner` por padrão, desde o bootstrap — antes, `reset_two_factor` exigia concessão manual pela tela de papéis.
- Telas de gerenciar Admins e Papéis ganharam um cabeçalho de destaque (nome da tela, quantos registros existem, ação de criar) e a lista passou a ser paginada em vez de mostrar todos os registros de uma vez; no celular, cada linha vira um cartão que abre um painel com o detalhe completo e as ações (editar, resetar 2FA quando aplicável), em vez de uma tabela apertada — pode ser fechado arrastando pra baixo, além de Esc/clique fora/botão.
- O painel de filtros (Atividade recente e Log de auditoria) passa a abrir como um painel deslizante vindo de baixo no celular (com botão de fechar e arrastar pra baixo pra descartar), em vez do popover ancorado no botão "Filtros", que ficava posicionado de forma estranha em telas estreitas.
- Campos de formulário (texto, seleção, checkbox, rótulo e mensagem de erro) passam a usar os mesmos tokens de cor do resto do painel, em vez de cores fixas — consolida o visual (inclusive no tema escuro) com o restante do design system.
- Mensagens de sucesso/erro do painel autenticado (ex. "Admin criado com sucesso") passam a aparecer como notificação no canto da tela (toast), que fecha sozinha ou manualmente, em vez de um bloco fixo no topo do conteúdo. Na tela de login/verificação de 2FA/reset de senha (antes do painel) continuam como estavam.
- Resetar o 2FA de outro admin passa a pedir confirmação por uma janela de diálogo do próprio painel, em vez do alerta nativo do navegador.
- Tela de perfil ganhou o mesmo cabeçalho de destaque das demais telas e organiza dois fatores/trocar senha em abas, em vez de duas seções seguidas na mesma página.
- Tela de configurações da loja ganhou o mesmo cabeçalho de destaque das demais telas; a troca do logo passa a ser por arrastar-e-soltar (ou clicar para selecionar), com preview da imagem escolhida antes de salvar, em vez do seletor de arquivo nativo do navegador.
- Logo da loja deixa de aceitar WebP — passa a aceitar só PNG, JPEG e SVG (os únicos formatos do novo seletor de arquivo), ainda até 2MB.
- Ícones de alerta/sucesso (banner e notificação), seta do seletor e alternância de tema passam a usar o mesmo traço do restante dos ícones do painel, em vez do desenho preenchido original.
- Telas de login, verificação de dois fatores e redefinição de senha ganham um painel de marca (logo e nome da loja) ao lado do formulário em telas largas; no celular continuam só com o formulário, como antes. As cores fixas dessas telas também passam a usar os tokens do design system.
- Todo campo de senha ganha um botão de olho dentro do campo pra mostrar/ocultar a senha digitada.
- Sessão de admin deixa de durar indefinidamente: passa a expirar em 24h a partir do login, ou em 30 dias se marcar a nova opção "Lembrar de mim" na tela de login (com aviso explicando a duração).
- Tela de códigos de recuperação do 2FA ganha um botão de copiar os códigos (além de baixar .txt/imagem, que já existiam) e cabeçalho de destaque, visual de cartão e entrada animada, igual ao resto do painel.
- Tela de configurar o 2FA (QR code) ganha cabeçalho de destaque, layout em duas colunas e um aviso sobre os códigos de recuperação que vêm a seguir.
- Linhas das telas de listagem (Admins, Papéis, Log de auditoria) ganham entrada animada em cascata, tanto na tabela (telas largas) quanto nos cartões (celular).
