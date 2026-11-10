# 0025 - Tipo de prop de página em arquivo próprio, página só compõe

## Status

Aceito

## Contexto

`docs/adr/0019` já separa, por página, o schema Zod (`<Página>.schema.ts`), o hook de formulário (`use<Página>Form.ts`) e o componente de formulário (`components/<Página>Form.tsx`) — mas nunca formalizou onde mora o **tipo da entidade recebida como prop do backend** (ex. o admin sendo editado, a lista de papéis pro dropdown, os códigos de recuperação), distinto do tipo derivado do schema Zod (que já tem lugar certo). Sem essa regra, cada página reinventou a própria organização: o mesmo formato de dado foi declarado como `interface`/tipo inline em dois, três, até quatro arquivos diferentes da mesma página — revisão encontrou isso em `Admin/Password/Edit` (`token: string`, 2x), `Admin/Admins` (`AdminToEdit`, 3x; papel pro dropdown, 4x, inclusive entre as páginas `New`/`Edit` do mesmo segmento) e `Admin/Roles` (`PermissionOption`, 4x; `RoleToEdit`, 3x).

A mesma revisão encontrou um segundo problema, de natureza diferente mas relacionada: `Admin/Admins/Edit.tsx` (#54, botão "Resetar 2FA") chamava `usePage()` e continha a lógica de confirmação/envio direto no arquivo da página — `docs/adr/0019` (seção 3) já dizia que a página "só" compõe filhos e chama `useTranslation`, mas isso nunca foi reforçado pra hook/lógica que não seja de formulário (o ADR original só fala de `useForm`/schema, não de qualquer outro hook ou lógica de interação).

## Decisão

**Tipo de prop de página (não o tipo derivado do schema Zod) sempre em arquivo próprio, nunca inline/duplicado:**

- Tipo usado por **uma só** página do segmento → `<Página>.types.ts`, ao lado do `.schema.ts` (ex. `Edit.types.ts` com `AdminToEdit`).
- Tipo usado por **mais de uma** página do mesmo segmento (ex. a lista de papéis pro dropdown, usada tanto em `New` quanto em `Edit` de `Admin/Admins`) → `types.ts` no nível do segmento, sem prefixo de página.
- `page.tsx`, `use<Página>Form.ts` e `components/<Página>Form.tsx` importam o tipo do arquivo certo — nunca redeclaram.
- Página sem nenhuma prop tipada (ex. `Admin/Dashboard/Show`, sem props) não ganha arquivo de tipo vazio só por uniformidade — mesma exceção já valendo pra `components/shared/` em `docs/adr/0019`.

**Arquivo da página só compõe — nenhum hook além de `useTranslation`, nenhuma lógica de interação direto nele:** reforçando `docs/adr/0019` (seção 3) pra qualquer hook/lógica, não só formulário. Uma ação com estado próprio, condição de permissão ou efeito colateral (ex. confirmar e enviar uma requisição) vira seu próprio componente em `components/`, que chama `usePage()`/qualquer hook que precisar internamente — a página continua só montando esse componente.

## Consequências

- Mais um arquivo por página quando há tipo de entidade (`<Página>.types.ts` ou o `types.ts` do segmento) — aceito pelo mesmo racional já aceito em `docs/adr/0019` (SRP, arquivo pequeno com responsabilidade única preferível a um grande).
- Renomear/alterar um campo da entidade (ex. adicionar um campo no admin retornado pelo backend) passa a exigir mudar um arquivo só, não dois ou três em sincronia manual.
- Qualquer página nova que receba prop tipado já nasce com esse arquivo, sem precisar de revisão pra notar a duplicação depois.
- Lógica de interação (confirmação, chamada de rota, condição de permissão) sempre visível/testável no seu próprio componente, nunca escondida dentro do arquivo que deveria só compor.
