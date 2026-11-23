import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { useTranslation } from "react-i18next";

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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={dialogOverlay()}
              />
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={dialogContent()}
              >
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
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
