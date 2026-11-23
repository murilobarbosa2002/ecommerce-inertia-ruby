import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Popover as RadixPopover } from "radix-ui";

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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={popoverContent()}
              >
                <div className={popoverScrollArea()}>{children}</div>
              </motion.div>
            </RadixPopover.Content>
          </RadixPopover.Portal>
        )}
      </AnimatePresence>
    </RadixPopover.Root>
  );
}
