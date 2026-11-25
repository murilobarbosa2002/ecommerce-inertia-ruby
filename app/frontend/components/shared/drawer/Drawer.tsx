import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { useTranslation } from "react-i18next";

import ScaleFade from "@/components/motion/ScaleFade";
import SlideFade from "@/components/motion/SlideFade";

import { type DrawerProps } from "./Drawer.types";
import { drawerContent, drawerOverlay } from "./Drawer.variants";

// Arrasta pra fechar: offset vertical além de 120px ou um arrasto rápido o
// suficiente (velocidade > 500px/s), mesmo sem passar dos 120px, fecha —
// cobre tanto o gesto lento (arrastou bastante) quanto o "flick" rápido
// (arrastou pouco, mas com intenção clara). Nos dois casos abaixo do
// limite, dragSnapToOrigin devolve o painel pro lugar sozinho.
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

// Bottom sheet: painel ancorado na borda inferior, pro caso de detalhe de
// linha no mobile (DataTable) — sempre fechável (Esc, clique fora, botão,
// ou arrastando pra baixo, affordance real de bottom sheet no mobile).
// Mesmo padrão de composição do Dialog (ScaleFade no overlay, aqui
// SlideFade no conteúdo, entrando de baixo pra cima).
export default function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: DrawerProps) {
  const { t } = useTranslation();

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild forceMount>
              <ScaleFade scale={1} duration={0.2} className={drawerOverlay()} />
            </RadixDialog.Overlay>
            <RadixDialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
            >
              <SlideFade
                direction="up"
                duration={0.2}
                className={drawerContent()}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                dragSnapToOrigin
                onDragEnd={(_event, info) => {
                  if (
                    info.offset.y > DISMISS_OFFSET ||
                    info.velocity.y > DISMISS_VELOCITY
                  ) {
                    onOpenChange(false);
                  }
                }}
              >
                <div
                  className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-line-strong"
                  aria-hidden="true"
                />
                <div className="mb-4 flex items-center justify-between gap-4">
                  <RadixDialog.Title className="truncate text-base font-semibold text-fg">
                    {title}
                  </RadixDialog.Title>
                  <RadixDialog.Close
                    aria-label={t("shared.dialog.close")}
                    className="shrink-0 text-fg-subtle hover:text-fg"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </RadixDialog.Close>
                </div>
                {children}
              </SlideFade>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
