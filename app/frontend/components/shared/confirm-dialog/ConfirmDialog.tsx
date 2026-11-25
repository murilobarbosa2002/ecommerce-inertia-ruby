import { AnimatePresence } from "motion/react";
import { AlertDialog as RadixAlertDialog } from "radix-ui";

import ScaleFade from "@/components/motion/ScaleFade";
import Button from "@/components/shared/button/Button";

import { type ConfirmDialogProps } from "./ConfirmDialog.types";
import {
  confirmDialogContent,
  confirmDialogOverlay,
} from "./ConfirmDialog.variants";

// Distinto do Dialog (RadixDialog): AlertDialog é modal e sempre tem
// Cancel/Action — pra confirmação de ação irreversível, não pra conteúdo
// arbitrário. Nunca use pra substituir o Dialog comum.
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmIntent = "primary",
}: ConfirmDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixAlertDialog.Portal forceMount>
            <RadixAlertDialog.Overlay asChild forceMount>
              <ScaleFade
                scale={1}
                duration={0.2}
                className={confirmDialogOverlay()}
              />
            </RadixAlertDialog.Overlay>
            <RadixAlertDialog.Content asChild forceMount>
              <ScaleFade duration={0.2} className={confirmDialogContent()}>
                <RadixAlertDialog.Title className="mb-2 text-lg font-semibold text-fg">
                  {title}
                </RadixAlertDialog.Title>
                <RadixAlertDialog.Description className="mb-4 text-sm text-fg-muted">
                  {description}
                </RadixAlertDialog.Description>
                <div className="flex justify-end gap-2">
                  <RadixAlertDialog.Cancel asChild>
                    <Button type="button" intent="outline">
                      {cancelLabel}
                    </Button>
                  </RadixAlertDialog.Cancel>
                  <RadixAlertDialog.Action asChild>
                    <Button
                      type="button"
                      intent={confirmIntent}
                      onClick={onConfirm}
                    >
                      {confirmLabel}
                    </Button>
                  </RadixAlertDialog.Action>
                </div>
              </ScaleFade>
            </RadixAlertDialog.Content>
          </RadixAlertDialog.Portal>
        )}
      </AnimatePresence>
    </RadixAlertDialog.Root>
  );
}
