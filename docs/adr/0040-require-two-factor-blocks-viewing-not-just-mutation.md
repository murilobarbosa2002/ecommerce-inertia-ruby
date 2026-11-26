# 0040 - Obrigatoriedade do 2FA passa a bloquear também visualização

## Status

Aceito. Substitui a parte de `docs/adr/0023` que liberava `GET`/`HEAD` incondicionalmente pra um admin sem 2FA ativo. A aplicação em dois níveis (servidor como autoridade real, cliente como feedback) e o restante do contexto/consequências de `docs/adr/0023` continuam vigentes, sem mudança.

## Contexto

`docs/adr/0023` decidiu que um admin sem 2FA ativo "não consegue fazer nada", mas deliberadamente liberou `GET`/`HEAD` sempre — a justificativa registrada era permitir que o dashboard renderizasse o aviso obrigatório.

Na prática isso abriu uma brecha maior do que o pretendido: qualquer página do painel (não só o dashboard) responde normalmente a uma requisição `GET` de um admin sem 2FA, incluindo páginas com dados reais de outras contas (ex. `Admin/Admins/Index`, com e-mail e papel de todo admin cadastrado). O único obstáculo era um `Dialog` renderizado no cliente por cima do conteúdo já entregue — descoberto ao navegar direto pra `/admin/admins` com uma conta sem 2FA configurado: a tela carregava com os 12 admins reais visíveis por trás do modal. Isso contraria a própria premissa de `docs/adr/0010` ("validação sempre no servidor") — o bloqueio real dependia só da UI não ter um link pra essa URL, não de o servidor recusar a resposta.

## Decisão

Um admin sem 2FA ativo só pode ver duas telas, além do que já podia fazer sem sessão: o dashboard (`Admin/Dashboard/Show` — números gerais, atalhos, feed de atividade) e a própria tela de perfil (`Admin/Profile/Show` — é por ela que troca a senha sem depender do 2FA, igual já valia pra mutação). Qualquer outra rota, em qualquer verbo (`GET` incluso), redireciona para a tela de configurar o 2FA.

Implementação: `AdminPanel::RequireTwoFactor#require_two_factor_for_mutation` vira `#require_two_factor!`, roda em todo verbo (não só mutação), e redireciona para `new_admin_two_factor_path` (não mais `root_path`) quando bloqueia. `DashboardsController` (todas as ações), `ProfilesController#show`/`#update` e `TwoFactorsController#new`/`#create`/`#destroy` ganham `skip_before_action :require_two_factor!` explícito — mesma mecânica de exceção deliberada já estabelecida em `docs/adr/0023`, só que agora cobrindo também a ação de visualização, não só a de mutação.

No cliente, o `Dialog` não-fechável de `PanelLayout` (que só fazia sentido quando havia conteúdo real por trás dele pra esconder) dá lugar a um `Toast` de alerta — já que agora só aparece sobre o dashboard/perfil, que o próprio admin sem 2FA tem permissão de ver, um aviso dispensável (fechável, reaparece a cada navegação enquanto o 2FA continuar desativado) é suficiente; não há mais necessidade de bloquear visualmente uma tela que o servidor já efetivamente protege.

## Consequências

- Nenhuma página com dado de terceiro (outro admin, papel, auditoria, configuração da loja) é mais entregue pelo servidor a uma conta sem 2FA, mesmo contornando a UI (URL direta, chamando o endpoint via curl/script) — o bloqueio de visualização agora tem a mesma autoridade de servidor que já valia só pra mutação.
- O dashboard mostra números agregados (total de admins, quantos estão sem 2FA, feed de atividade) mesmo pra quem ainda não ativou o próprio 2FA — aceito deliberadamente: é a única tela que o admin precisa ver pra saber que a obrigatoriedade existe e pra onde ir resolvê-la, e os dados ali são agregados/de terceiros só na medida em que já eram expostos antes desta decisão.
- Toda rota nova que precisa ficar visível a um admin sem 2FA continua exigindo `skip_before_action :require_two_factor!` explícito (mesma consequência já registrada em `docs/adr/0023`) — a lista de exceções agora cobre visualização e mutação juntas, sempre uma decisão deliberada por controller/ação, nunca implícita.
- O `Dialog` não-fechável criado em `docs/adr/0023` fica sem uso real (só duas telas o mostrariam, e ambas já são legítimas de ver) — removido do `PanelLayout` em favor do `Toast` já existente no painel; o componente `Dialog` em si continua no projeto (usado em `ConfirmDialog`), só este uso específico muda.
