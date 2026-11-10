# 0029 - Estado local de componente com lógica não-trivial vai pra hook próprio

## Status

Aceito

## Contexto

`docs/adr/0025` já separa estado/lógica de apresentação pra **página** (`use<Página>Form.ts`, ao lado do arquivo da página). Revisão perguntou se a mesma regra deveria valer pra qualquer **componente** (não só página) — motivada por `PasswordGenerator` (`components/shared/password-generator/`), que concentrava 5 `useState` inter-relacionados, cálculo de clamp de tamanho e geração assíncrona de clipboard direto no arquivo de apresentação.

Levantamento exaustivo (todo hook do React — não só os 5 mais comuns — em todo `.tsx` de `pages/` e `components/`) confirmou que esse não é um padrão espalhado: `PasswordGenerator` era o único componente com estado local de verdade (`useState`). Outros casos que chamam `usePage()` direto no componente (`PanelLayout`, `ResetTwoFactorButton`, `AuthLayout`) só derivam um valor simples (ex. um booleano) e/ou um handler de 1-2 linhas — já cobertos pela exceção que `docs/adr/0019` já previa ("elemento simples que não justifique extração própria").

## Decisão

A mesma separação de `docs/adr/0025` (estado/lógica num hook próprio, apresentação só no `.tsx`) se estende a **qualquer** componente, não só página — com um critério explícito pra não virar regra absoluta sem exceção:

- **Extrai pra hook próprio** (`use<NomeDoComponente>.ts`, ao lado do componente, ex. `components/shared/password-generator/usePasswordGenerator.ts`) quando o componente tem **múltiplos `useState` inter-relacionados** e/ou **lógica não-trivial** (cálculo com ramificação, chamada assíncrona, mais de uma linha de efeito colateral).
- **Fica inline**, sem extração, quando é só um valor derivado simples (ex. um booleano a partir de props/contexto) e/ou um handler de uma ou duas linhas — mesma exceção já escrita em `docs/adr/0019` pra "elemento simples que não justifique extração própria". Forçar extração nesses casos criaria um arquivo a mais sem reduzir complexidade real nenhuma.

## Consequências

- `PasswordGenerator.tsx` fica só com JSX, lendo tudo de `usePasswordGenerator()` — mesmo padrão de página (hook)/apresentação (`.tsx`), agora também em componente.
- `PanelLayout`, `ResetTwoFactorButton`, `AuthLayout` continuam como estão — não é inconsistência, é a exceção já prevista sendo aplicada de propósito, não por omissão.
- Componente novo com estado próprio real nasce já com esse hook, sem precisar de revisão pra notar depois.
- O critério ("múltiplos estados inter-relacionados ou lógica não-trivial" vs. "valor derivado simples") é uma linha de julgamento, não uma métrica automática — continua exigindo leitura humana do componente, não um lint novo.
