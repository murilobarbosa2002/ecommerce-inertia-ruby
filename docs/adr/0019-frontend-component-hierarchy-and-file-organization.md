# 0019 - Hierarquia de componentes e organização de arquivo no frontend

## Status

Aceito

## Contexto

As primeiras páginas reais do painel admin (PR7 da Fase 3) aplicavam as variantes de `tailwind-variants` (`docs/adr/0012`) direto como `className={variante()}` em tags nativas (`<input>`, `<button>`, `<label>`, `<p>`) espalhadas pelas páginas, e cada página concentrava num único arquivo `.tsx`: o schema Zod, o tipo derivado, o `useForm`/`zodResolver`, a lógica de submissão (`router.post`/`router.patch`) e o JSX inteiro do formulário. Isso funcionava para 4 páginas pequenas, mas não escala: nenhuma variante de estilo era reutilizável como componente de verdade, e misturar validação/estado/apresentação no mesmo arquivo cresce rápido conforme páginas novas aparecem (painel admin, depois loja).

Faltava uma regra explícita de **onde cada tipo de coisa mora** — sem isso, cada página nova reinventaria a própria organização, inconsistente com a anterior.

## Decisão

### 1. Primitivo de UI reutilizável (usado por mais de um contexto) vira componente em `components/shared/<nome-do-componente>/`

Cada primitivo genérico (`Button`, `Input`, `Label`, `FieldError`, ...) tem sua **própria pasta**, nomeada em kebab-case (`button/`, `input/`, `label/`, `field-error/`) — nunca agrupado por categoria genérica (ex. nunca uma pasta `form/` reunindo vários primitivos). Dentro da pasta, três arquivos, cada um com uma responsabilidade:

- `<Nome>.types.ts` — só o(s) tipo(s)/`interface`(s) de prop do componente.
- `<Nome>.variants.ts` — só a variante `tv()` (`docs/adr/0012`) do componente.
- `<Nome>.tsx` — só o componente em si (JSX), importando o tipo e a variante dos dois arquivos acima. Nenhum dos três arquivos mistura responsabilidade com os outros.

Um primitivo nunca é aninhado dentro da pasta de outro só porque hoje aparece sempre junto na UI (ex. `Label`/`FieldError` não ficam dentro de `input/`, mesmo só sendo usados ao lado de `Input` até agora) — nesting reflete dependência de código real entre componentes, não coincidência de uso atual. `Label`/`FieldError` são genéricos o suficiente pra valer também para um futuro `Select`/`Checkbox`, por exemplo.

### 2. Componente específico de uma página (não reutilizável fora dela) vive em `pages/<Segmento>/components/`

O formulário completo de uma página (o `<form>...</form>` inteiro, com os primitivos de `components/shared/` montados) não é responsabilidade do arquivo da página — é extraído pro seu próprio componente dentro de uma pasta `components/` **local ao segmento** (ex. `pages/Admin/Password/components/PasswordNewForm.tsx`, `pages/Admin/Password/components/PasswordEditForm.tsx` — ambos no mesmo segmento `Password`, cada um na sua própria página). `pages/<Segmento>/components/` nunca é confundido com `components/shared/` nem com `components/admin/`: o primeiro é local a um segmento de página específico, os outros dois são compartilhados entre páginas.

### 3. Responsabilidade do arquivo da página (`New.tsx`, `Edit.tsx`) é só compor o layout

A página em si (`export default function PageName()`) só: chama `useTranslation`, renderiza `<AuthLayout>`/`<Head>`, e monta o(s) componente(s) filho(s) (ex. `<PasswordNewForm />`) mais qualquer elemento simples que não justifique extração própria (ex. o link "esqueci minha senha"). Nenhum `useForm`, nenhum schema, nenhum `<form>` inteiro, nenhuma chamada a `router.post`/`router.patch` direto no arquivo da página.

### 4. Schema, hook de formulário e componente de formulário — cada um no seu arquivo, hook fora de `components/`

Por página, três arquivos com papéis fixos (convenção já em uso antes deste ADR, aqui formalizada):

- `<Página>.schema.ts` — schema Zod + tipo derivado (`z.infer`), ex. `New.schema.ts`.
- `use<Página>Form.ts` — hook que encapsula `useForm`/`zodResolver` e a submissão (`onSubmit`, incluindo `router.post`/`router.patch`), devolvendo só o que o componente de formulário precisa (`register`, `errors`, `isSubmitting`, `onSubmit` já pronto pro `<form onSubmit>`). Fica **ao lado** do arquivo da página (`pages/<Segmento>/use<Página>Form.ts`), não dentro de `components/` — é lógica, não apresentação.
- `pages/<Segmento>/components/<Página>Form.tsx` — o componente de formulário (regra 2 acima), que importa e chama o hook.

## Consequências

- Primitivo (`Button`, `Input`, etc.) testável isoladamente (renderiza, aplica prop) sem precisar montar uma página inteira — teste de tipo/variante/componente podem até ser escritos independentemente, já que cada um está no seu próprio arquivo.
- Página nova segue um esqueleto fixo e previsível: schema → hook → componente de formulário → página que só compõe — menos decisão ad-hoc por página.
- Mais arquivos por página (de 1 pra 4: página, schema, hook, componente de formulário) — aceito deliberadamente: cada arquivo pequeno com responsabilidade única (SRP, já exigido em `docs/adr/0004`) é preferível a um arquivo grande concentrando validação, estado e apresentação.
- Um primitivo que hoje só é usado por uma página, mas é genérico por natureza (não amarrado a um caso de uso específico), ainda vai pra `components/shared/`, não pra `pages/<Segmento>/components/` — a pasta certa depende da natureza do componente (reutilizável vs. específico de página), não de quantos lugares o usam hoje.
