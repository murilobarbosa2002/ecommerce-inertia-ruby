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
