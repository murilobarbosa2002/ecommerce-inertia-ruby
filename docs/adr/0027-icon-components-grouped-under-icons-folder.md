# 0027 - Ícones agrupados em `components/shared/icons/`

## Status

Aceito

## Contexto

`docs/adr/0019` rejeita explicitamente agrupar primitivo por categoria genérica (ex. nunca uma pasta `form/` reunindo `Button`/`Input`/`Label`/`FieldError`) — o racional é que esses componentes têm papéis diferentes (controle de formulário, rótulo, mensagem de erro), e agrupá-los por "aparecem juntos num formulário" seria coincidência de uso, não parentesco real.

Ícone estático (`CheckCircleIcon`, `ChevronDownIcon`, `ExclamationIcon`, `MoonIcon`, `SunIcon`) é um caso diferente: o próprio `docs/adr/0019` já reconhece ícone como categoria própria, na sua cláusula de exceção ("um primitivo sem variante `tv()` e sem prop própria, ex. um ícone SVG estático"). Os cinco ícones do projeto não têm papéis diferentes entre si como `Button`/`Input`/`Label` têm — são, todos, a mesma coisa (SVG estático sem variante nem prop própria), e cresceram soltos direto em `components/shared/`, misturados com primitivos de papel/complexidade bem diferente (`Select`, `Dialog`, `PasswordGenerator`).

## Decisão

Ícones vivem em `components/shared/icons/<nome-do-ícone>/`, mantendo a regra de uma pasta por componente (`docs/adr/0019`, regra 1) — só com `icons/` como nível extra acima, não uma mudança na regra de pasta-por-componente em si. Isso não é a mesma coisa que o `form/` já rejeitado: `form/` juntaria componentes de papéis diferentes por coincidência de aparecerem juntos numa tela; `icons/` agrupa componentes que já são, por natureza, a mesma categoria (ícone estático), exatamente a categoria que o próprio ADR 0019 já nomeia na exceção.

Um ícone novo que ganhar variante `tv()` ou prop própria no futuro continua em `icons/<nome>/`, só ganhando os arquivos correspondentes (`.types.ts`/`.variants.ts`) — sair de `icons/` só se deixar de ser um ícone estático de fato.

## Consequências

- `components/shared/` lista só primitivos de interação/estilo real (`Button`, `Input`, `Select`, `Dialog`, etc.); ícones ficam todos sob um único subnível, mais fácil de escanear os dois grupos separadamente.
- Import de ícone ganha um segmento extra no caminho (`@/components/shared/icons/sun-icon/SunIcon`) — aceito, mesmo padrão de indireção que qualquer pasta intermediária já tem no projeto.
- Não abre precedente pra agrupar outra categoria por conveniência — a categoria precisa ser genuína (mesma natureza, não coincidência de uso), como já era o critério antes desta decisão.
