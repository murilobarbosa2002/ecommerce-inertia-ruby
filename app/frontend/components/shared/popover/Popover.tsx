import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
} from "react";
import { AnimatePresence } from "motion/react";
import { Popover as RadixPopover } from "radix-ui";

import ScaleFade from "@/components/motion/ScaleFade";
import Drawer from "@/components/shared/drawer/Drawer";
import useMediaQuery from "@/hooks/useMediaQuery";

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
  drawerOnMobile = false,
  title,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  // Mesmo breakpoint que DataTable usa pra decidir tabela vs cartão —
  // "mobile", aqui, é tela abaixo do breakpoint `lg` do Tailwind.
  const isMobile = useMediaQuery("(max-width: 1023px)");

  if (drawerOnMobile && isMobile) {
    // trigger não passa por Radix.Trigger aqui (o Drawer não tem conceito
    // de gatilho, só open/onOpenChange controlados de fora) — clonar pra
    // injetar onClick é o mesmo efeito do asChild+Slot do Radix, sem
    // precisar de um segundo Root só pra isso.
    const clonedTrigger = isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
          onClick: () => {
            setOpen(true);
          },
        })
      : trigger;

    return (
      <>
        {clonedTrigger}
        <Drawer open={open} onOpenChange={setOpen} title={title}>
          {children}
        </Drawer>
      </>
    );
  }

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
