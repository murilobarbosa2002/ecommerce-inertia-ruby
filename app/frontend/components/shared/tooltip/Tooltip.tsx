import { Tooltip as RadixTooltip } from "radix-ui";
import { useState } from "react";

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
//
// `open` é controlado (nunca deixado pro Radix gerenciar sozinho), e todo
// pedido de ABRIR vindo do Radix (`onOpenChange(true)`) só é aceito com
// content disponível — o rastreamento de hover do Root roda mesmo sem o
// Content montado, então um hover que começa enquanto content é vazio (ex.
// o botão já mostrando o rótulo como texto normal) ainda dispara
// `onOpenChange(true)` depois do delay. Sem filtrar por `hasContent` aqui,
// esse "true" ficava guardado e, assim que content passava a ter valor de
// novo, o tooltip pipocava já aberto, sem esperar um hover novo, fechando
// pouco depois porque o cursor normalmente não está mais sobre o
// gatilho menor/realocado. Fechar (`onOpenChange(false)`) sempre é aceito.
export default function Tooltip({
  content,
  side = "top",
  children,
}: TooltipProps) {
  const hasContent = Boolean(content);
  const [open, setOpen] = useState(false);

  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root
        open={hasContent && open}
        onOpenChange={(next) => {
          setOpen(hasContent && next);
        }}
      >
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        {hasContent ? (
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
