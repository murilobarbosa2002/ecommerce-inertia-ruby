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
