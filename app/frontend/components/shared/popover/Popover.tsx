import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Popover as RadixPopover } from "radix-ui";

import ScaleFade from "@/components/motion/ScaleFade";

import { type PopoverProps } from "./Popover.types";
import { popoverContent, popoverScrollArea } from "./Popover.variants";

// overflow-y-auto num wrapper interno, não no Content: a barra de rolagem
// desenha rente à borda do próprio elemento com overflow, ignorando o
// padding de conteúdo em volta dela.
//
// open controlado (não deixado pro Radix gerenciar sozinho): a animação de
// saída (Motion, docs/adr/0017) precisa que o Content continue montado
// durante a animação — forceMount tira o Radix dessa decisão, e quem
// decide manter montado é o {open && ...} do AnimatePresence.
export default function Popover({
  trigger,
  children,
  align = "end",
}: PopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <AnimatePresence>
        {open && (
          <RadixPopover.Portal forceMount>
            <RadixPopover.Content
              asChild
              align={align}
              sideOffset={8}
              forceMount
            >
              <ScaleFade className={popoverContent()}>
                <div className={popoverScrollArea()}>{children}</div>
              </ScaleFade>
            </RadixPopover.Content>
          </RadixPopover.Portal>
        )}
      </AnimatePresence>
    </RadixPopover.Root>
  );
}
