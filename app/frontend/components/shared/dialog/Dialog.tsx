import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { useTranslation } from "react-i18next";

import ScaleFade from "@/components/motion/ScaleFade";

import { type DialogProps } from "./Dialog.types";
import { dialogContent, dialogOverlay } from "./Dialog.variants";

// Sem onOpenChange: Esc/clique fora ficam bloqueados e não há botão de
// fechar — pro aviso obrigatório de 2FA, que não pode ser descartado sem
// resolver o motivo do aviso. Com onOpenChange, vira fechável nos três.
export default function Dialog({
  open,
  title,
  description,
  children,
  onOpenChange,
}: DialogProps) {
  const { t } = useTranslation();
  const closable = Boolean(onOpenChange);

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild forceMount>
              <ScaleFade scale={1} duration={0.2} className={dialogOverlay()} />
            </RadixDialog.Overlay>
            <RadixDialog.Content
              asChild
              forceMount
              onEscapeKeyDown={(event) => {
                if (!closable) event.preventDefault();
              }}
              onPointerDownOutside={(event) => {
                if (!closable) event.preventDefault();
              }}
            >
              <ScaleFade duration={0.2} className={dialogContent()}>
                {closable && (
                  <RadixDialog.Close
                    aria-label={t("shared.dialog.close")}
                    className="absolute top-4 right-4 text-fg-subtle hover:text-fg"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </RadixDialog.Close>
                )}
                <RadixDialog.Title className="mb-2 text-lg font-semibold text-fg">
                  {title}
                </RadixDialog.Title>
                {description && (
                  <RadixDialog.Description className="mb-4 text-sm text-fg-muted">
                    {description}
                  </RadixDialog.Description>
                )}
                {children}
              </ScaleFade>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
