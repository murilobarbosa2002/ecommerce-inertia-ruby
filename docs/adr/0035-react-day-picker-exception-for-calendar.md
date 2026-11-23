# 0035 - react-day-picker como exceção ao primitivo-sempre-radix-ui pro calendário

## Status

Aceito

## Contexto

`docs/adr/0012` fixa que todo componente de UI com comportamento parte de um primitivo do pacote `radix-ui` — nunca reimplementado do zero, nunca vindo de outra lib headless. Essa regra se sustentou bem até o filtro de data/hora da atividade recente do dashboard: Radix UI não tem, e nunca teve, nenhum primitivo de calendário/seletor de data. As opções reais eram construir uma grade de dias, navegação de mês e seleção de intervalo do zero, ou adotar uma lib dedicada madura.

Construir do zero significa reimplementar e manter testado um componente com bastante superfície (grade correta por mês, anos bissextos, seleção de intervalo com dois cliques, navegação por teclado, localização pt-BR) que uma lib headless estabelecida já resolve — exatamente o tipo de esforço que `docs/adr/0012` queria evitar ao decidir por Radix UI em vez de reimplementação própria, só que não há opção Radix UI aqui pra evitar.

## Decisão

`react-day-picker` é aceito como **exceção pontual e documentada** à regra de `docs/adr/0012`, especificamente pra seleção de data/intervalo de data — não uma reversão geral da regra. Continua valendo pra tudo que Radix UI cobre (Dialog, Popover, Checkbox, Select, Tooltip, etc.): só quando não existe primitivo Radix equivalente é que outra lib headless entra em consideração, caso a caso, nunca por padrão.

Estilização segue o mesmo padrão do resto do projeto: sem o tema pronto da lib, classes do componente sobrescritas via a prop `classNames` com os tokens semânticos deste projeto (`docs/adr/0031`), não CSS de terceiro solto.

## Consequências

- Nova dependência direta do projeto (`react-day-picker`, e `date-fns` como dependência direta explícita, já que o código do projeto importa `date-fns` diretamente pra formatar/parsear datas, em vez de depender dela só transitivamente através de `react-day-picker`).
- Qualquer filtro de data futuro no painel reusa este mesmo componente (`components/shared/date-range-picker/DateRangePicker.tsx`), em vez de cada tela reinventar sua própria solução.
- Se um dia Radix UI adicionar um primitivo de calendário, substituir `react-day-picker` por ele volta a ser compatível com a regra geral de `docs/adr/0012` sem precisar de um novo ADR — essa troca seria só uma implementação, não uma mudança de decisão de arquitetura.
- Essa exceção é especificamente pra "seleção de data/calendário" — não abre precedente geral pra qualquer lib headless ser aceita só porque é mais conveniente; a regra de `docs/adr/0012` continua sendo a primeira opção sempre que Radix UI cobrir o caso.
