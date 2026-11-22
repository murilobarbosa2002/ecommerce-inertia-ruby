import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuProps } from "./DropdownMenu.types";

// Raiz do menu: só controla abrir/fechar. A aparência vive nas partes
// (docs/adr/0033): trigger, content, item, label, separator.
export default function DropdownMenu(props: DropdownMenuProps) {
  return <RadixDropdownMenu.Root {...props} />;
}
