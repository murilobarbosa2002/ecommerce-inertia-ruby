# 0012 - Zod, React Hook Form, Radix UI e tailwind-variants como stack de formulário/UI

## Status

Aceito

## Contexto

Até agora o frontend não tinha nenhuma convenção fixada para formulário, validação em runtime no cliente ou componentes de UI com comportamento (modal, select, checkbox, etc.) — só a página de exemplo do Inertia. `docs/adr/0010` já antecipava parte disso: fixa que validação de formulário no frontend é UX, não segurança, e que dado que cruza fronteira de confiança deve ser validado em runtime com Zod, com o tipo TypeScript inferido do schema (`z.infer`). Faltava decidir a lib de gerenciamento de formulário em volta do Zod, e a lib de componentes/primitivos de UI — essa segunda parte já tinha sido decidida como **Radix UI** (headless, entre as opções Radix UI/React Aria/Headless UI), mas nunca formalizada em ADR.

## Decisão

A stack de formulário/validação/UI deste projeto é:

- **Zod** (pacote `zod`) para schema de validação e inferência de tipo (`z.infer`), em toda fronteira de confiança — formulário, resposta de API externa, webhook. Consistente com `docs/adr/0010`.
- **React Hook Form** (`react-hook-form`) + **`@hookform/resolvers`** (especificamente `@hookform/resolvers/zod`, função `zodResolver`) para gerenciar estado e validação de formulário, plugando o schema Zod direto no `useForm`.
- **Radix UI**, instalado via o pacote único `radix-ui` (pacote guarda-chuva atual da biblioteca — reexporta todos os primitivos, ex. `import { Dialog, Checkbox } from "radix-ui"`), não os pacotes individuais `@radix-ui/react-*` de versões anteriores. Primitivos acessíveis e sem estilo (Dialog, Checkbox, Select, Popover, Tooltip, etc.); a estilização é sempre feita por este projeto com Tailwind, nunca um tema pronto da lib.
- **tailwind-variants** para a API de variantes/slots por cima do Tailwind, com resolução automática de conflito de classes. Depende de `tailwind-merge` como peer — instalado como dependência direta deste projeto (a lib não o empacota de propósito, por redução de superfície de cadeia de suprimentos; o ciclo de vida de `tailwind-merge` fica sob nosso próprio fluxo de dependências, não transitivo). Compatível com Tailwind CSS v4 (já em uso neste projeto, `docs/adr/0009`), com uma ressalva: a v4 removeu `content.transform`, então variantes responsivas não são geradas automaticamente — precisam de classe responsiva manual quando necessário.

Antes de reportar como concluído, as quatro libs foram testadas juntas: um formulário real, com schema Zod, `zodResolver`, `useForm` do React Hook Form e um `Checkbox` do Radix UI estilizado com `tv()` do tailwind-variants, renderizado sob Vitest/jsdom com React 19. O teste confirmou que a integração funciona de ponta a ponta e foi removido depois (não testava nenhum comportamento real de aplicação, só a integração das libs — não faz sentido como teste permanente).

Esse teste revelou um problema real de infraestrutura, não pedido mas necessário corrigir: **jsdom não implementa `ResizeObserver` nem os métodos de Pointer Events (`hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`) nem `scrollIntoView`**, que o Radix UI assume que existem e usa no mount de vários primitivos (Checkbox, Dialog, Select, Popover, Tooltip). Sem isso, qualquer teste que renderize um primitivo Radix quebra. Corrigido com polyfills no-op em `app/frontend/test/setup.ts` — esse código é permanente (parte da infraestrutura de teste), diferente do teste que o revelou.

## Consequências

- Toda validação de formulário no frontend usa Zod + `zodResolver` + React Hook Form a partir de agora — nunca validação manual ad-hoc (`if` espalhado, `useState` de erro por campo).
- Todo componente de UI com comportamento (não leiaute puro) parte de um primitivo do pacote `radix-ui` — não é reimplementado do zero nem vem de outra lib headless.
- Estilização de variante usa `tv()` do `tailwind-variants` em vez de concatenação manual de classe condicional (`className={isActive ? "a" : "b"}` espalhado).
- Qualquer teste futuro de componente que use Radix UI já está coberto pelos polyfills de `app/frontend/test/setup.ts` — não precisa redescobrir o problema do zero.
- Variante responsiva de `tailwind-variants` (ex. `sm:`, `lg:`) precisa ser escrita manualmente na classe, já que a v4 do Tailwind não dá mais suporte à geração automática que a lib usava nas versões anteriores do Tailwind.
