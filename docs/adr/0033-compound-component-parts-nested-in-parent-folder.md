# 0033 - Partes de componente composto ficam na pasta do componente pai

## Status

Aceito

## Contexto

`docs/adr/0019` manda cada primitivo de `components/shared/` ter a sua própria pasta, e diz que um primitivo nunca fica aninhado dentro da pasta de outro só porque hoje aparece sempre junto na interface: o aninhamento deve refletir dependência real de código.

Alguns componentes são compostos por partes que só fazem sentido dentro do pai. O `Card` é o primeiro caso: `CardHeader`, `CardBody` e `CardFooter` não são usados fora de um `Card`, dependem do mesmo contrato visual (borda, divisores, raio do canto inferior do rodapé) e evoluem junto com ele. Tratá-las como primitivos soltos em `components/shared/` mistura, na mesma listagem, peças autônomas (`Button`, `Input`) com partes que não funcionam sozinhas, e esconde a relação entre elas. O mesmo vai valer para a `DataTable` (cabeçalho, linha, paginação, barra de ferramentas) e para a `Sidebar` (item, seção).

## Decisão

Uma parte de componente composto vive em uma subpasta da pasta do pai, `components/shared/<pai>/<parte>/`, com a mesma estrutura de três arquivos do ADR 0019 (`<Parte>.types.ts`, `<Parte>.variants.ts`, `<Parte>.tsx`). Exemplo: `components/shared/card/card-header/CardHeader.tsx`.

O critério para uma peça ser "parte" e não "primitivo" é que ela não tenha uso legítimo fora do pai: se uma peça passa a ser usada sozinha em outro contexto, ela sai da subpasta e vira primitivo, como qualquer outro. A dependência de código pode ser contratual (mesmo contrato visual e semântico do pai) mesmo quando a parte não importa o pai.

O arquivo do pai não importa as partes: quem monta a composição é quem usa (`<Card><CardHeader/>...</Card>`), o que mantém o pai simples e as partes opcionais.

## Consequências

- `components/shared/` lista só componentes autônomos; as partes ficam agrupadas com quem as define.
- O caminho de import ganha um segmento extra (`@/components/shared/card/card-header/CardHeader`), o mesmo custo de indireção já aceito para os ícones (`docs/adr/0027`).
- A regra do ADR 0019 contra agrupar por categoria genérica continua valendo: aqui o agrupamento é por pertencer ao mesmo componente, não por aparecer junto na tela.
- Se uma parte se mostrar útil sozinha, mover para fora da subpasta é uma mudança localizada de caminho de import.
