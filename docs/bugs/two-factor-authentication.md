# Bugs: autenticação de dois fatores

Bugs relacionados a TOTP, códigos de recuperação e ao fluxo de verificação em duas etapas. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Verificação de 2FA não checava bloqueio de conta

- **Data:** 2026-11-04
- **Severidade:** crítica
- **PR:** #32

### O que aconteceu

`AdminAuthentication::VerifyTwoFactorCode` validava o código TOTM/recuperação sem checar se a conta já estava bloqueada (`locked_at` presente e dentro da janela de bloqueio). Uma conta bloqueada por 5 tentativas erradas de senha podia completar o login normalmente só acertando o código de 2FA, contornando o bloqueio por completo.

### Causa raiz

O bloqueio de conta foi implementado pensando só no fluxo de senha (`AdminAuthentication::AuthenticateWithPassword`); o fluxo de 2FA foi acrescentado depois como uma etapa adicional, sem herdar essa checagem.

### Como foi encontrado

Revisão própria do fluxo de login com 2FA ativo, ao avaliar explicitamente o cenário "conta bloqueada, mas o segundo fator ainda está disponível".

### Impacto

Bypass real de segurança: bloqueio de conta (defesa contra força bruta de senha) deixava de ter efeito pra qualquer conta com 2FA ativo, bastando o atacante ter (ou adivinhar) o código TOTP/recuperação.

### Correção

`AdminAuthentication::CompleteTwoFactorLogin` (novo serviço) passou a checar o bloqueio antes de delegar pra `VerifyTwoFactorCode`, rejeitando a verificação (mesma resposta genérica de "sessão de verificação expirada") enquanto a conta estiver bloqueada.

### Verificação

Spec cobrindo "rejeita código correto quando a conta está bloqueada": bloqueia a conta manualmente, envia o código TOTP correto, espera a rejeição. Confirmado quebrando a checagem de propósito (removendo a chamada a `locked?`) e vendo o spec falhar antes de restaurar a correção.

## Desativar 2FA com senha errada não tinha limite de tentativas

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #32

### O que aconteceu

`AdminPanel::TwoFactorsController#destroy` (desativar 2FA, exige reautenticação com a senha atual) aceitava qualquer número de tentativas de senha errada sem acionar o bloqueio de conta — diferente do login, que bloqueia depois de 5 tentativas.

### Causa raiz

O bloqueio de conta (`AdminAuthentication::RecordFailedLoginAttempt`) só era chamado no fluxo de login; a reautenticação pra desativar 2FA validava a senha diretamente, sem reusar esse serviço.

### Como foi encontrado

Revisão própria do fluxo de desativação de 2FA, comparando com o rigor já aplicado ao login.

### Impacto

Força bruta ilimitada da senha de um admin através da tela de desativação de 2FA, mesmo com o bloqueio de 5 tentativas vigente no login normal — um caminho alternativo sem a mesma defesa.

### Correção

`TwoFactorsController#destroy` passou a chamar `AdminAuthentication::RecordFailedLoginAttempt` (com `event_type: :reauthentication_failed`) a cada senha errada, acionando o mesmo bloqueio de 5 tentativas usado no login.

### Verificação

Spec "bloqueia a conta após 5 senhas erradas tentando desativar o 2FA": envia 5 senhas erradas, espera `locked_at` presente. Confirmado quebrando a chamada ao serviço de bloqueio de propósito e vendo o spec falhar antes de restaurar a correção.

## Revisitar a tela de setup do 2FA sobrescrevia o secret ativo

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #32

### O que aconteceu

`AdminPanel::TwoFactorsController#new` (tela de configuração do 2FA) gerava um `otp_secret` novo a cada visita, mesmo quando o admin já tinha 2FA ativo e configurado num app autenticador. Qualquer acesso acidental a essa tela depois da ativação invalidava o secret em uso.

### Causa raiz

A ação de gerar o secret não verificava se o 2FA já estava ativo (`otp_required_for_login?`) antes de gerar um novo — tratava "acessar a tela de setup" como sinônimo de "quero configurar do zero", mesmo quando já havia uma configuração ativa.

### Como foi encontrado

Verificado na prática via `bin/rails runner`: depois de ativar o 2FA e revisitar a tela de setup, o código do app autenticador (gerado com o secret antigo, ainda no celular) parou de ser aceito, confirmando a sobrescrita.

### Impacto

Podia travar o próprio login do admin: o app autenticador continuava mostrando códigos baseados no secret antigo, que já não existia mais no banco, exigindo um código de recuperação (ou acesso de outro admin) pra desbloquear a situação.

### Correção

`new` passou a redirecionar com uma mensagem genérica ("A autenticação de dois fatores já está ativa") quando `otp_required_for_login?` já é verdadeiro, sem gerar um secret novo.

### Verificação

Spec "não sobrescreve o secret quando o 2FA já está ativo": ativa o 2FA, guarda o secret, revisita a tela de setup, confirma que o secret não mudou. Confirmado quebrando a guarda de propósito e vendo o spec falhar antes de restaurar a correção.

## Código TOTP idêntico durante a mesma janela de 30s rejeitado como replay no teste

- **Data:** 2026-11-04
- **Severidade:** baixa
- **PR:** #32

### O que aconteceu

Specs que confirmavam a ativação do 2FA e, na sequência, tentavam logar gerando "um código novo" via `ROTP::TOTP#now` recebiam o código idêntico ao já usado na etapa anterior (mesma janela de 30 segundos) — rejeitado pela proteção contra replay (`AdminAuthentication::VerifyTwoFactorCode`), fazendo specs corretos falharem.

### Causa raiz

`ROTP::TOTP#now` retorna o mesmo valor durante toda a janela de 30 segundos — não é determinado pela ordem de chamadas, só pelo tempo. Specs rápidos o suficiente (como é o caso de testes automatizados) acabam chamando `#now` duas vezes dentro da mesma janela.

### Como foi encontrado

Escrevendo os specs de login com 2FA: um teste que confirmava a ativação e depois tentava logar com um "código novo" falhava — não por bug na proteção contra replay, mas porque os dois códigos eram o mesmo valor.

### Impacto

Nenhum em produção (a proteção contra replay está funcionando como deveria) — só afeta a escrita de testes que encadeiam duas verificações de TOTP em sequência rápida.

### Correção

`travel_to 31.seconds.from_now` entre as duas etapas do teste, garantindo uma janela de tempo nova antes de gerar o segundo código.

### Verificação

Confirmado lendo o comportamento de `ROTP::TOTP#now` e reproduzindo o teste sem o `travel_to` (falha) e com ele (passa) — não é um teste de regressão de produção, é a correção do próprio teste.

## QR code de configuração do 2FA não aparecia na tela

- **Data:** 2026-11-09
- **Severidade:** alta
- **PR:** #51

### O que aconteceu

Teste manual no browser: a área onde o QR code deveria aparecer vinha em branco, mesmo a página renderizando normalmente e o resto do formulário funcionando. Duas causas raiz distintas, encontradas em duas rodadas de teste manual (a primeira correção não foi suficiente sozinha).

### Causa raiz

1. `TwoFactorsController#qr_code_svg` chamava `RQRCode::QRCode#as_svg` com `standalone: false` — essa opção da gem `rqrcode` faz o método devolver **só o `<path>` cru**, sem nenhuma tag `<svg>` envolvendo (é pensada pra quando quem chama já tem um `<svg>` próprio e só quer embutir o desenho dentro). `svg_attributes: { role: "img", ... }` também ficava sem efeito nenhum, porque não existe elemento `<svg>` pra aplicar esses atributos. O frontend (`Admin/TwoFactor/New.tsx`) injeta esse valor via `dangerouslySetInnerHTML` dentro de um `<div>` comum — um `<path>` solto, fora de qualquer contexto `<svg>`, não tem namespace válido e o navegador simplesmente não desenha nada.
2. Corrigido o primeiro problema, o QR code **ainda** não aparecia — só uma área branca pequena. `viewbox: true` faz `as_svg` emitir `viewBox="0 0 W H"` no lugar de `width`/`height` explícitos. Isso funciona quando o CSS do contexto dá um tamanho ao `<svg>`, mas este é injetado cru via `dangerouslySetInnerHTML` (fora do alcance de qualquer classe Tailwind) dentro de um `<div className="w-fit ...">` — sem `width`/`height` nem CSS nenhum direcionando o elemento, o tamanho renderizado fica ambíguo entre navegadores, pequeno demais pra mostrar o desenho.

Esse método já existia no backend desde a PR do 2FA original (`docs/adr/0013`), mas nunca tinha sido exercitado de ponta a ponta — a página que o consome só foi criada nesta PR, então os dois bugs ficaram invisíveis até agora.

### Como foi encontrado

Teste manual no browser real, fora do Vitest/jsdom (que nunca rasteriza SVG de verdade, só confirma que o elemento existe no DOM) — a área do QR code aparecia em branco nas duas rodadas, apesar do resto da página renderizar normalmente.

### Impacto

Bloqueava completamente o fluxo de ativar 2FA pela UI — o admin nunca consegue escanear um QR code que não existe visualmente. A URI de provisionamento em texto (alternativa manual) continuava funcionando, mas o caminho principal (escanear) ficava quebrado sem nenhum erro visível, e nenhum teste automatizado pegava isso (ver "Verificação").

### Correção

1. Removida a opção `standalone: false` — `as_svg` passa a usar o padrão da gem (`standalone: true`), que inclui a tag `<svg>...</svg>` completa.
2. Removida também a opção `viewbox: true` — `as_svg` passa a usar o padrão da gem (`viewbox: false`), emitindo `width`/`height` em pixel explícitos no próprio `<svg>`, sem depender de nenhum CSS externo pra ter tamanho visível.

### Verificação

Teste novo em `spec/requests/admin/two_factors_spec.rb` ("gera um qr_code_svg visível") extrai o prop `qr_code_svg` do JSON embutido na resposta (`data-page`) e confirma `<svg`/`</svg>` e `width="\d+"`/`height="\d+"` — confirmado vermelho restaurando `standalone: false` e, separadamente, `viewbox: true` de propósito, verde com a correção final. O teste original (`GET .../new`, "gera um secret TOTP novo") só checava o `otp_secret` no banco, nunca o conteúdo do SVG retornado — por isso não pegava nenhum dos dois bugs; é exatamente o tipo de lacuna que só aparece testando visualmente no browser, não só com specs. Confirmação visual final (QR code de fato legível por um app autenticador) depende de teste manual no browser, que esta sessão não teve como fazer sozinha (sem MCP de browser conectado).

## Resetar o 2FA de outro admin não validava se o alvo já estava sem 2FA ativo

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #54

### O que aconteceu

`AdminPanel::AdminsController#reset_two_factor` (botão "Resetar 2FA" na tela de editar admin) chamava `AdminTwoFactor::DisableTwoFactor.call(admin: target, ...)` sem checar se `target` já estava com `otp_required_for_login?` falso. A rake task de último recurso (`bin/rails admin:disable_two_factor`, implementada na mesma PR) tinha essa checagem desde o início — só o controller ficou sem.

### Causa raiz

`AdminTwoFactor::DisableTwoFactor` (o service reaproveitado pelos dois pontos de entrada) não valida esse caso sozinho: ele só zera `otp_required_for_login`/`otp_secret`/`last_otp_at` e destrói os códigos de recuperação — chamar isso num admin que já está assim não falha, só não muda nada de fato. Sem uma guarda explícita em cada ponto de entrada, clicar "Resetar 2FA" numa conta que já não tem 2FA ativo "funcionava" silenciosamente, sem avisar o admin que clicou que não havia nada pra resetar.

### Como foi encontrado

Revisão deliberada comparando os dois pontos de entrada que chamam o mesmo service (a rake task e o controller novo) antes do commit — a rake task já tinha a checagem, o controller não, uma inconsistência entre os dois caminhos pro mesmo efeito.

### Impacto

Baixo: nenhuma consequência de segurança ou dado incorreto (o service é idempotente, não corrompe nada), mas gerava um `AuditEvent` do tipo `two_factor_reset_by_admin` registrando um reset que nunca aconteceu de fato — poluindo o histórico de auditoria com um evento que sugere uma ação real sem ela ter ocorrido.

### Correção

Guarda `unless target.otp_required_for_login?` adicionada no controller, redirecionando com um alerta (`admin.admins.reset_two_factor.not_enabled`) antes de chamar o service — mesmo padrão já usado pela rake task.

### Verificação

Teste em `spec/requests/admin/admins_spec.rb` ("não reseta e avisa quando o admin alvo já está sem 2FA ativo"), confirmando que nenhum `AuditEvent` novo é criado. Confirmado vermelho removendo a guarda de propósito (o teste falhava mostrando que um `AuditEvent` era criado mesmo assim) e verde com ela restaurada.
