# 0039 - Expiração de sessão do admin e "lembrar de mim"

## Status

Aceito

## Contexto

`docs/adr/0013` decidiu sessão nativa do Rails 8 pra autenticação de admin, mas não detalhou duração — na implementação original, o cookie assinado de sessão (`cookies.signed.permanent[:admin_session_id]`) nunca expirava: a sessão só terminava por logout explícito ou por eventos que já destroem todas as sessões do admin (trocar a senha, resetar 2FA). Uma sessão sem expiração nenhuma, por tempo indeterminado, é um risco de segurança real pra um painel administrativo — um cookie vazado ou um dispositivo compartilhado esquecido logado fica válido indefinidamente.

A UX confirmada pra fechar essa lacuna: toda sessão passa a ter prazo fixo a partir do momento do login (não desliza com o uso — não é renovada a cada request), com duração diferente dependendo de uma escolha explícita do admin no login ("Lembrar de mim"), nunca mais permanente de verdade.

## Decisão

- **Sem "Lembrar de mim" marcado (padrão):** sessão expira 24 horas depois do login.
- **Com "Lembrar de mim" marcado:** sessão expira 30 dias depois do login — mais longo, mas nunca ilimitado.
- Expiração é **fixa**, não deslizante: calculada uma vez, no momento em que a sessão é criada (`AdminPanel::Authentication#start_new_admin_session_for`), guardada em `admin_sessions.expires_at`. Continuar usando o painel não estende o prazo.
- O cookie assinado (`admin_session_id`) expira junto com a mesma data/hora de `expires_at`, em vez de `.permanent` — tanto o navegador quanto o servidor concordam em quando a sessão deixa de valer.
- No servidor, toda leitura de sessão (`find_admin_session_by_cookie`) confere `expires_at`; uma sessão expirada é tratada como deslogada (a linha é destruída, o cookie é removido), mesmo que o cookie em si ainda esteja presente no navegador — o servidor é sempre a autoridade final, nunca só a data do cookie.
- A escolha de "Lembrar de mim" é feita na tela de login (antes de qualquer verificação de 2FA) e precisa sobreviver até a sessão real ser criada — pra quem tem 2FA ativo, isso só acontece depois do código ser confirmado. Por isso a escolha fica guardada junto do estado de login pendente (`session[:pending_admin_remember_me]`, ao lado de `pending_admin_id`), não perdida no meio do fluxo.
- Um aviso explícito aparece ao lado do checkbox, explicando a duração de 30 dias e desaconselhando a opção em computador compartilhado — a escolha não fica implícita.
- Eventos que já invalidam toda sessão do admin (trocar a senha, resetar o 2FA — ambos via `admin_sessions.destroy_all`) continuam exatamente como estavam, sem nenhuma relação com `expires_at`: destroem a linha inteira, independente de quando ela expiraria.

## Consequências

- Sessões criadas antes desta mudança (sem `expires_at`) foram migradas com um prazo de 24h a partir da migration, em vez de invalidadas na hora — força um novo login em breve, sem derrubar ninguém no instante exato do deploy.
- Qualquer lugar que crie uma `AdminSession` diretamente (specs incluídos) precisa fornecer `expires_at` — a coluna é `NOT NULL`, sem valor padrão implícito.
- Se um admin reabrir o painel depois do prazo expirar, é tratado exatamente como qualquer sessão terminada (redirect pro login) — nenhum aviso específico de "sua sessão expirou" existe ainda; se isso for considerado necessário no futuro, é uma decisão de UX separada, não parte desta.
- Essa decisão não muda nada do fluxo de bloqueio de conta por tentativas de senha erradas (`docs/adr/0013`) nem da obrigatoriedade de 2FA (`docs/adr/0023`) — são mecanismos independentes (tentativa de login vs. sessão já autenticada).
