# 0036 - Nome, sobrenome e celular na conta de admin

## Status

Aceito

## Contexto

A Fase B do painel (DataTable genérica, busca/filtro pras telas de Admins e Papéis) ia decidir o campo de busca da tela de Admins assumindo só o e-mail — único campo de texto que a conta tem hoje (`docs/adr/0013`). Revisão de escopo, antes de iniciar essa fase, apontou que a conta de admin modela só e-mail/senha/papel, sem nenhum dado de identificação pessoal (nome) nem de contato alternativo ao e-mail (telefone) — uma lacuna que afeta não só a busca da Fase B, mas qualquer tela futura que precise identificar um admin por nome (ex. menu da conta, atribuição de uma ação de auditoria) ou contatá-lo fora do e-mail.

A mesma necessidade existe para uma futura conta de cliente (usuário comum da loja, fora do escopo do painel admin) — mas esse model (`User`) não existe no projeto ainda; nenhuma tela, rota ou fluxo de cliente foi implementado até este ADR. Resolver os dois (admin e cliente) no mesmo ADR misturaria uma decisão imediata (schema do `Admin` existente) com uma hipotética (schema de um model que não existe) — melhor registrar essa segunda parte como decisão futura, não implementá-la adiantado.

## Decisão

`Admin` ganha três colunas novas:

- `first_name`/`last_name` (`string`, `NOT NULL`) — obrigatórios pra toda conta, inclusive as já existentes (a migration faz backfill de um placeholder visível pra qualquer linha pré-existente, antes de travar a coluna como `NOT NULL`).
- `phone` (`string`, nullable) — opcional; nem todo admin precisa informar um celular.

**Celular é dado de contato, criptografado em repouso** (`encrypts :phone`), consistente com a regra já fixada em `docs/adr/0010` ("dados de contato quando aplicável"). Normalizado pra só dígitos antes de persistir (`normalizes :phone`, removendo parênteses/hífen/espaço que o formulário aceitar), e validado no formato de celular brasileiro (DDD + 9 + 8 dígitos, `Admin::PHONE_FORMAT`) quando presente — sem validação nenhuma quando em branco. `config.filter_parameters` ganha `:phone`.

**Mesmo tratamento de auditoria do e-mail e do papel.** `tracked_by_change_reason` (`docs/adr/0013`) passa a incluir `first_name`, `last_name` e `phone` — editar qualquer um desses campos exige motivo explícito e gera versão no PaperTrail, igual já acontecia só pra `email_address`/`role_id`.

**O model `User` (conta de cliente) fica fora de escopo deste ADR.** Quando o projeto chegar na parte de conta de cliente (fora do painel admin, ainda sem nenhuma tela/rota), esse model nasce já com os mesmos três campos (nome, sobrenome, celular opcional) — mas essa é uma decisão a formalizar no próprio ADR daquela fase, não antecipada aqui.

## Consequências

- A tela de Admins (Fase B) ganha um critério de busca mais completo (nome, além do e-mail) desde o início, sem precisar de uma segunda migração de schema no meio da fase.
- `bin/rails admin:create` (CLI) e as telas de criar/editar admin do painel passam a pedir nome e sobrenome sempre, celular como opcional.
- Celular não é pesquisável por `ILIKE`/índice (dado criptografado) — qualquer filtro futuro por celular exigiria um índice determinístico separado (`deterministic: true` do Active Record Encryption) ou aceitar que celular não é um campo de busca, decisão a tomar se essa necessidade aparecer de verdade.
- Quando o model `User` (cliente) for criado, ele referencia este ADR pros mesmos três campos, evitando decidir o mesmo formato de novo — mas com seu próprio ADR de criação do model em si.
