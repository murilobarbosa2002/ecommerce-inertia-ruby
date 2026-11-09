import { Dialog as RadixDialog } from "radix-ui";

import { type DialogProps } from "./Dialog.types";
import { dialogContent, dialogOverlay } from "./Dialog.variants";

// Sem Dialog.Close e com onEscapeKeyDown/onPointerDownOutside bloqueados —
// este componente é intencionalmente não-fechável, pro único uso que tem
// hoje (aviso de 2FA obrigatório, PanelLayout). Se um dia precisar de uma
// variante fechável, isso é extensão futura, não escopo deste componente.
export default function Dialog({ open, title, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={dialogOverlay()} />
        <RadixDialog.Content
          className={dialogContent()}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
        >
          <RadixDialog.Title className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </RadixDialog.Title>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
