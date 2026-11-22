# 0032 - lucide-react como fonte de ícones da interface

## Status

Aceito

## Contexto

`docs/adr/0027` agrupa os ícones do projeto em `components/shared/icons/<nome-do-ícone>/`, um componente por SVG desenhado à mão. Isso funcionou com cinco ícones (`CheckCircleIcon`, `ChevronDownIcon`, `ExclamationIcon`, `MoonIcon`, `SunIcon`), mas a reformulação do painel admin precisa de dezenas: navegação lateral, menus de ação, estados vazios, tipos de evento da tela de auditoria, indicadores de ordenação em tabelas. Desenhar e manter cada um à mão não escala, e um conjunto feito por pessoas diferentes tende a ficar inconsistente em traço, tamanho e proporção.

O `lucide-react` é um conjunto de ícones de traço único, licença ISC, com cada ícone exportado como componente React individual. O bundler elimina os que não são importados, então o custo é proporcional ao que é usado.

## Decisão

Ícone novo da interface vem do `lucide-react`, importado direto no ponto de uso (`import { Loader2 } from "lucide-react"`), sem um componente wrapper em `components/shared/icons/` por ícone. O componente que precisa de um ícone como dado (ex. `EmptyState`) recebe o tipo `LucideIcon` por prop.

Todo ícone decorativo é escondido da árvore de acessibilidade (`aria-hidden="true"`); ícone que carrega significado sozinho (botão só com ícone) ganha o nome acessível no elemento interativo, não no SVG (`docs/adr/0028`).

`components/shared/icons/` (`docs/adr/0027`) continua existindo só para SVG que o `lucide-react` não oferece (ex. marca da loja ou um desenho próprio), com a mesma regra de pasta por componente. Os cinco ícones atuais ficam como estão até a tela que os usa ser migrada; nenhuma troca em massa neste momento.

## Consequências

- Adicionar um ícone deixa de ser tarefa de desenho e passa a ser um `import`.
- O conjunto fica visualmente coerente (mesmo traço e grade) sem esforço de revisão.
- Nova dependência de produção. O risco é baixo: ela é só de apresentação, sem acesso a dado nem à rede.
- Dois mecanismos de ícone convivem durante a migração (SVGs próprios e lucide). O ADR 0027 continua válido para o que não vier do lucide.
- Trocar de biblioteca no futuro tocaria todos os imports de ícone; o tipo `LucideIcon` aparece só nas props de componentes genéricos, o que limita o raio da mudança.
