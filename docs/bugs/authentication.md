# Bugs: autenticação

Bugs relacionados a login, senha, sessão, bloqueio de conta e reset de senha. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Unicidade de e-mail do admin não era case-insensitive

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #25

### O que aconteceu

A validação `uniqueness: true` em `email_address` no model `Admin` comparava os valores exatamente como armazenados, sem normalizar caixa. Dois admins podiam ser criados com o mesmo e-mail em caixas diferentes (`admin@example.com` e `Admin@Example.com`), já que o banco os trata como valores distintos.

### Causa raiz

E-mail é um identificador case-insensitive por convenção (RFC 5321 trata a parte de domínio como case-insensitive, e a prática universal trata a parte local do mesmo jeito) — `uniqueness: true` sozinho no Rails não aplica essa normalização, é uma comparação de string literal.

### Como foi encontrado

Revisão própria do model `Admin` depois da feature de identidade já estar em uso, ao avaliar os specs existentes contra esse cenário específico.

### Impacto

Duas contas de admin distintas podiam existir pro "mesmo" e-mail aos olhos de qualquer humano, abrindo espaço pra confusão de autenticação/autorização e contornando a expectativa de "um e-mail = uma conta".

### Correção

Normalização de `email_address` para minúsculas antes de salvar (`before_validation` ou equivalente) e `uniqueness: { case_sensitive: false }` na validação, garantindo que a unicidade seja de fato case-insensitive tanto na validação quanto no armazenamento.

### Verificação

Spec dedicado (`test: cobre unicidade de e-mail do admin com case diferente`) cria um admin com um e-mail e tenta criar outro só com a caixa alterada, esperando falha de validação. Confirmado quebrando a normalização de propósito (removendo o `before_validation`) e vendo o spec ficar vermelho antes de restaurar a correção.

## Token de `generates_token_for` não-determinístico comparado entre chamadas diferentes no teste

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #31

### O que aconteceu

O spec do `PasswordsMailer` tentava validar o link de reset de senha comparando o corpo do e-mail renderizado contra uma nova chamada de `admin.password_reset_token` — mas cada chamada de `generates_token_for` gera um token diferente pro mesmo registro (o payload assinado embute um timestamp), então a comparação nunca batia, mesmo com o fluxo de e-mail correto.

### Causa raiz

Suposição implícita de que `generates_token_for` é determinístico (mesmo registro → mesmo token), quando na verdade o token é assinado com um timestamp embutido a cada chamada — só o *resultado* de resolver o token (`Admin.find_by_password_reset_token(token)`) é estável, não o token em si.

### Como foi encontrado

Escrevendo o spec do `PasswordsMailer`: o teste ficava vermelho (ou passava por coincidência de timing, não por verificar o comportamento certo) mesmo com a implementação correta.

### Impacto

Spec sem valor de regressão real — teria passado ou falhado por motivo errado, sem de fato confirmar que o link de reset enviado por e-mail funciona.

### Correção

Extrair o token de verdade do corpo renderizado do e-mail (via regex) e confirmar que ele resolve pro admin certo (`Admin.find_by_password_reset_token(token)`), em vez de comparar strings de token geradas em momentos diferentes.

### Verificação

Confirmado que o spec corrigido fica vermelho se o link do e-mail apontar pro token errado (testado deliberadamente antes de restaurar a implementação correta) e verde com o fluxo real.
