# Bugs: i18n e validação de dado

Bugs relacionados a locale, tradução e validação de dado em fronteira de confiança. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## `rails-i18n` não traduz a chave `password_too_long` do `has_secure_password`

- **Data:** 2026-11-04
- **Severidade:** baixa
- **PR:** #24

### O que aconteceu

Ao testar a mensagem de erro renderizada pra uma senha maior que 72 bytes (limite aceito pelo bcrypt via `has_secure_password`), a mensagem aparecia como `"Translation missing: pt-BR.errors.messages.password_too_long"` em vez de um texto em português, mesmo com `rails-i18n` instalado e o locale padrão em `pt-BR`.

### Causa raiz

`rails-i18n` traduz a grande maioria das mensagens de validação que o Rails/ActiveModel geram, mas não cobre 100% delas — `password_too_long` é uma chave específica gerada por `has_secure_password` (fora do namespace `activerecord` comum), que essa gem não traduz pra `pt-BR`.

### Como foi encontrado

Testando de verdade a mensagem de erro renderizada (não assumindo que `rails-i18n` cobre automaticamente), ao escrever os specs de validação do model `Admin`.

### Impacto

Usuário final (admin) veria uma mensagem de erro em formato de chave de tradução faltando, em inglês técnico, em vez de uma mensagem compreensível em português — ruim pra qualquer campo de senha com esse limite.

### Correção

Chave `errors.messages.password_too_long` adicionada manualmente em `config/locales/pt-BR.yml`.

### Verificação

Spec que testa a mensagem de erro de verdade (não um valor genérico) com uma senha maior que 72 bytes, confirmando o texto em português esperado. Confirmado removendo a chave de propósito e vendo a mensagem voltar a aparecer como "Translation missing", antes de restaurar a correção.

## Coluna `:string` do Postgres sem limite de tamanho (e-mail do Admin)

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #24

### O que aconteceu

A coluna `email_address` (tipo `:string` no Postgres) não tinha nenhuma validação de tamanho máximo no model `Admin` — diferente do `varchar` do MySQL, o `:string` do Postgres não impõe limite de tamanho por padrão, aceitando qualquer tamanho de valor, inclusive payloads multi-megabyte.

### Causa raiz

Suposição implícita (comum vindo de outros bancos) de que uma coluna `:string` já tem um limite de tamanho razoável por padrão — no Postgres isso não é verdade, `:string` e `:text` são equivalentes em armazenamento.

### Como foi encontrado

Revisão de segurança do model `Admin` depois da feature já estar em uso, avaliando explicitamente vetores de esgotamento de recurso (payload grande em campo de texto).

### Impacto

Vetor de negação de serviço (DoS) por esgotamento de recurso: nada impedia um valor de `email_address` com tamanho arbitrariamente grande ser aceito e persistido, consumindo espaço de banco e memória de forma desproporcional a um e-mail real.

### Correção

`validates :email_address, length: { maximum: 254 }` adicionado ao model `Admin` — 254 é o limite máximo de um endereço de e-mail segundo a RFC 5321.

### Verificação

Spec que tenta salvar um admin com um e-mail maior que 254 caracteres, esperando falha de validação. Confirmado removendo a validação de propósito e vendo o registro ser salvo sem erro, antes de restaurar a correção.

## Teste de tradução I18n tautológico com `I18n.t()` como esperado e atual

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #31

### O que aconteceu

Ao refatorar uma string mágica repetida (`"nova-senha-456"`) num spec de reset de senha, a mudança inicial trocou também a asserção da mensagem de erro esperada de uma string literal (`"E-mail ou senha inválidos"`) para `I18n.t("a.mesma.chave")` — fazendo o teste comparar a chave de tradução contra ela mesma.

### Causa raiz

`I18n.t(chave) == I18n.t(chave)` é sempre verdadeiro, mesmo que a tradução esteja quebrada ou faltando — um teste assim nunca detecta um texto traduzido errado, porque não compara contra nenhum valor fixo de referência.

### Como foi encontrado

Ao avaliar se a troca de string literal por `I18n.t(...)` generalizava bem a regra de "nenhuma string mágica espalhada", foi testado deliberadamente quebrar a tradução da chave em `config/locales/pt-BR.yml`: a versão com `I18n.t(...)` continuou verde (deveria ter ficado vermelha); a versão com a string literal foi pro vermelho, como deveria.

### Impacto

Teste sem nenhum valor de regressão pra verificar que a tradução de uma mensagem específica está correta — passaria igual com a tradução quebrada ou ausente, dando falsa confiança de cobertura.

### Correção

Regra fixada em `CONTRIBUTING.md`: dado de teste arbitrário (senha, nome, etc.) repetido em vários lugares vira constante nomeada; texto esperado de uma tradução que está especificamente sob teste permanece como string literal (é a própria asserção, não um valor arbitrário).

### Verificação

Confirmado com o experimento descrito em "Como foi encontrado" — quebrando a tradução de propósito e comparando o comportamento das duas versões do teste antes de fixar a regra.

## Campo de quantidade de caracteres do gerador de senha não validava o valor digitado

- **Data:** 2026-11-09
- **Severidade:** média
- **PR:** #48

### O que aconteceu

No gerador de senha aleatória (`PasswordGenerator`), o campo "Quantidade de caracteres" só tinha os atributos `min`/`max` do HTML (`type="number"`), que não impedem digitar um valor fora do intervalo nem deixar o campo vazio. Digitar um valor maior que 72 gerava uma senha maior do que o que o bcrypt de fato usa; limpar o campo e gerar produzia uma senha de comprimento zero, silenciosamente.

### Causa raiz

`min`/`max` em `<input type="number">` são só dicas de UI (afetam os botões de incremento/decremento e o estado de validade do form), não bloqueiam digitação direta nem campo vazio — o valor bruto do campo (`event.target.value`) chegava direto em `generatePassword({ length, ... })` sem nenhuma validação de fato aplicada no componente.

### Como foi encontrado

Autorrevisão do diff antes de abrir o PR: ao reler `PasswordGenerator.tsx`, o comentário que justifica `MAX_LENGTH = 72` ("evita gerar senha maior do que o que o backend de fato usa") não correspondia a nenhuma validação de fato aplicada no valor digitado.

### Impacto

Um admin poderia copiar uma senha de, por exemplo, 500 caracteres, acreditando que todos contribuem pra força da senha — mas `has_secure_password`/bcrypt usa só os primeiros 72 bytes pra hash, tornando o resto decorativo sem nenhum aviso. Limpar o campo e gerar produzia uma senha vazia sem erro nenhum.

### Correção

O valor digitado passou a ser mantido como string livre num estado próprio (`lengthInput`), sem clamping a cada tecla — clampar a cada tecla corrompia a digitação de números com mais de um dígito (o primeiro dígito isolado já cai fora do intervalo e seria clampado antes do segundo dígito chegar). O clamp (`Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, ...))`) e o fallback pro caso de `NaN` (campo vazio) passaram a acontecer só no momento de gerar a senha (`handleGenerate`), não a cada `onChange`.

### Verificação

Dois casos novos em `PasswordGenerator.test.tsx` (comprimento acima de 72 clampado pra 72; campo vazio não gera senha de comprimento zero), confirmados vermelhos revertendo o clamp antes de restaurar a correção.

## Dois campos de "senha atual" na mesma página com o mesmo label

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #51

### O que aconteceu

A tela de perfil (`Admin/Profile/Show`) tem dois formulários independentes na mesma página — trocar senha e desativar o 2FA — cada um pedindo a senha atual pra confirmar a ação. Os dois campos nasceram com o mesmo label ("Senha atual"), e o teste de desativar o 2FA (`screen.getByLabelText("Senha atual")`) falhou com `getMultipleElementsFoundError`.

### Causa raiz

Dois campos de propósito diferente (confirmar uma troca de senha vs. confirmar a desativação do 2FA) descreviam a si mesmos com o texto genérico "Senha atual", sem nenhuma distinção — ambíguo tanto pro teste quanto, na prática, pro próprio admin usando a página sem contexto visual suficiente pra saber qual campo pertence a qual ação.

### Como foi encontrado

Rodando o teste de `Admin/Profile/Show` recém-escrito, antes de abrir o PR.

### Impacto

Nenhum em produção (os dois campos funcionam corretamente de forma isolada, cada um dentro do próprio `<form>`) — mas é uma ambiguidade real de UX, não só de teste: nada no texto do campo em si diferencia as duas ações.

### Correção

Label do campo de desativar 2FA mudou de "Senha atual" pra "Senha atual pra desativar", distinguindo as duas ações pelo próprio texto do campo, não só pela seção visual em que cada um está.

### Verificação

Teste de `Admin/Profile/Show.test.tsx` confirmado vermelho com o label duplicado, verde depois da correção.

## Trocar senha autenticado "passaria" sem trocar nada com um password em branco

- **Data:** 2026-11-09
- **Severidade:** média
- **PR:** #51

### O que aconteceu

`AdminPanel::ProfilesController#update` (trocar senha estando logado) chamava `admin.update(params.permit(:password, :password_confirmation))` direto — sem nenhuma guarda explícita pro caso de `password` vir em branco.

### Causa raiz

`has_secure_password` só valida presença de senha na criação do registro, não na atualização — a validação real checa se `password_digest` está presente, e esse atributo nunca é sobrescrito quando o `password` virtual recebe uma string vazia (a senha antiga continua intacta). Resultado: `admin.update(password: "", password_confirmation: "")` retorna `true` (válido), sem trocar nada de fato.

### Como foi encontrado

Revisão do próprio código antes de escrever o teste — ao reler `ProfilesController#update`, ficou claro que nada impedia um `password` em branco de "passar" pela validação do `has_secure_password`.

### Impacto

Um request com `password` em branco (por bug de frontend, requisição manual, etc.) destruiria todas as sessões da conta e reportaria "senha alterada com sucesso" sem ter trocado a senha de fato — o admin seria deslogado de todo lugar sem nenhum motivo real, achando que mudou a senha quando não mudou.

### Correção

Guarda explícita (`params[:password].blank?`) antes de chamar `admin.update`, com uma mensagem de erro própria (`admin.profiles.update.blank_password`) em vez de deixar a validação do `has_secure_password` decidir.

### Verificação

Teste em `spec/requests/admin/profiles_spec.rb` ("não troca a senha quando a nova senha vem em branco") confirmado vermelho removendo a guarda de propósito, verde com ela restaurada.

## Atributos do model `Role` sem tradução pt-BR, erro de validação aparecia em inglês

- **Data:** 2026-11-09
- **Severidade:** baixa
- **PR:** #52

### O que aconteceu

Ao testar a mensagem de erro de `change_reason` em branco numa atualização do `Role` (ex. ao editar só a lista de permissões, sem mudar o nome), a mensagem veio como `"Change reason não pode ficar em branco"` em vez de `"Motivo da alteração não pode ficar em branco"` — metade em inglês, metade em português.

### Causa raiz

`config/locales/pt-BR.yml` só tinha a chave `activerecord.attributes.admin.change_reason` traduzida (adicionada quando `Admin` ganhou `tracked_by_change_reason`). Quando o mesmo concern (`ChangeReasonRequired`) foi incluído em `Role` (PR #50/PR atual), o Rails caiu no fallback de humanizar o nome do atributo em inglês (`change_reason` → `"Change reason"`) por falta de uma chave equivalente sob `activerecord.attributes.role`.

### Como foi encontrado

Escrevendo o teste de regressão que confirma a exigência de `change_reason` numa atualização do `Role` que só altera permissões (sem mudar `name`) — o teste comparava a mensagem completa esperada em português, não um valor genérico, e falhou mostrando o texto misto.

### Impacto

Baixo, mas real: qualquer admin usando a tela de papéis (PR de gerenciar papéis e permissões) veria uma mensagem de validação parcialmente em inglês — mesma classe de problema já documentado nesta categoria pra `password_too_long`, mas em código do próprio projeto, não de uma gem.

### Correção

Chaves `activerecord.attributes.role.name`/`change_reason` adicionadas em `config/locales/pt-BR.yml`, ao lado das equivalentes de `admin`.

### Verificação

Teste em `spec/requests/admin/roles_spec.rb` ("exige motivo da alteração mesmo quando só a lista de permissões muda") comparando a mensagem completa esperada — confirmado vermelho antes da tradução existir, verde depois.
