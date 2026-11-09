# 0023 - Aplicação real da obrigatoriedade do 2FA

## Status

Aceito

## Contexto

`docs/adr/0013` já decidiu que o 2FA é obrigatório pra toda conta `Admin`, "não um depois" — mas essa obrigatoriedade nunca foi de fato aplicada em código: `AdminPanel::TwoFactorsController` (ativar/desativar 2FA) e os services correspondentes já existiam, mas nenhuma página do frontend existia pra chegar até eles, e nenhum controller bloqueava uma conta sem 2FA de fazer qualquer outra coisa no painel.

A UX confirmada pra fechar essa lacuna: criar conta/logar não exige 2FA ativo (login continua funcionando normalmente); depois de autenticado, um admin sem 2FA não consegue fazer nenhuma ação real no painel até ativar — um aviso aparece assim que ele loga, explicando a obrigatoriedade e levando pra tela de configurar.

Isso levanta uma decisão de arquitetura própria: *onde* essa obrigatoriedade é de fato aplicada. Só um aviso de interface (modal) seria insuficiente — `docs/adr/0010` já fixa que autorização nunca depende só do cliente ("validação sempre no servidor"); alguém chamando o endpoint direto (curl, script) sem 2FA ativo não deveria conseguir mutar nada, com ou sem o aviso visual.

## Decisão

Aplicação em dois níveis, nenhum dispensando o outro:

**Servidor (autoridade real):** novo concern `AdminPanel::RequireTwoFactor`, incluído em `AdminPanel::BaseController` ao lado de `AdminPanel::Authentication`/`AdminPanel::Authorization`. Bloqueia (redirect pra `root_path` com `alert`) toda requisição de **mutação** (`POST`/`PATCH`/`PUT`/`DELETE`) de um admin já autenticado sem 2FA ativo. `GET`/`HEAD` nunca são bloqueados — bloquear visualização impediria até o dashboard de renderizar, que é onde o aviso obrigatório aparece. Rotas que o próprio admin sem 2FA precisa poder usar (ativar/desativar o 2FA, deslogar, trocar a senha) usam `skip_before_action` explícito.

**Cliente (feedback imediato):** `AdminPanel::BaseController#inertia_share` passa a compartilhar `current_admin_two_factor_enabled`. `PanelLayout` renderiza um `Dialog` (`components/shared/dialog/`, primeiro uso de `Dialog` do Radix no projeto) sempre que esse valor é `false`, em toda página — exceto nas próprias páginas de configurar o 2FA (`Admin/TwoFactor/New`/`RecoveryCodes`), senão o próprio caminho pra resolver o aviso ficaria bloqueado visualmente por ele. O `Dialog` não tem botão de fechar nem fecha com Escape/clique fora — só o botão que leva pra tela de configurar.

## Consequências

- Nenhuma mutação de um admin sem 2FA passa, mesmo contornando a UI (chamando o endpoint direto) — a obrigatoriedade de `docs/adr/0013` agora tem efeito real, não só documentado.
- `GET`/`HEAD` sempre liberados significa que "obrigatório" aqui quer dizer "não consegue *fazer* nada", não "não consegue *ver* nada" — um admin sem 2FA ainda navega o painel normalmente, só não consegue mutar.
- Toda rota nova que precisa ficar acessível a um admin sem 2FA (ex. uma futura tela de suporte/ajuda) precisa de `skip_before_action :require_two_factor_for_mutation` explícito — a lista de exceções cresce conforme o painel cresce, mas sempre precisa de uma decisão deliberada, nunca implícita.
- `Dialog` (`components/shared/dialog/`) nasce intencionalmente não-fechável, porque é o único uso que existe hoje — uma variante fechável (com `Dialog.Close`) é extensão futura, não escopo deste ADR.
