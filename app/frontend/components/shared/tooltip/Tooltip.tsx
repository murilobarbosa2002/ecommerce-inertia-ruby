import { Tooltip as RadixTooltip } from "radix-ui";

import { type TooltipProps } from "./Tooltip.types";
import { tooltipContent } from "./Tooltip.variants";

// O tooltip só complementa um elemento que já tem nome acessível (ex. o link
// de um item recolhido da sidebar) — nunca é a única fonte desse nome.
//
// O trigger (children) fica sempre montado, mesmo quando content é falsy:
// o chamador típico (sidebar recolhível) alterna entre ter e não ter
// tooltip no mesmo elemento conforme o estado collapsed. Se o Root/Trigger
// fosse condicionalmente removido da árvore nesse ponto, um tooltip aberto
// no momento da troca (hover + clique no botão de colapso) ficava com o
// conteúdo do Portal preso na tela, já que o unmount do Root interrompe o
// fechamento controlado pelo Radix em vez de passar por ele.
export default function Tooltip({
  content,
  side = "top",
  children,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        {content ? (
          <RadixTooltip.Portal>
            <RadixTooltip.Content
              side={side}
              sideOffset={8}
              className={tooltipContent()}
            >
              {content}
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        ) : null}
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
