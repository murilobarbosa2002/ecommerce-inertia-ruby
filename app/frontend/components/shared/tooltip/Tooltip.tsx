import { Tooltip as RadixTooltip } from "radix-ui";

import { type TooltipProps } from "./Tooltip.types";
import { tooltipContent } from "./Tooltip.variants";

// O tooltip só complementa um elemento que já tem nome acessível (ex. o link
// de um item recolhido da sidebar) — nunca é a única fonte desse nome.
export default function Tooltip({
  content,
  side = "top",
  children,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={8}
            className={tooltipContent()}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
