import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuTriggerProps } from "./DropdownMenuTrigger.types";

// asChild por padrão: o gatilho é o botão que quem usa já tem (avatar,
// ícone), não um <button> extra por fora.
export default function DropdownMenuTrigger({
  asChild = true,
  ...props
}: DropdownMenuTriggerProps) {
  return <RadixDropdownMenu.Trigger asChild={asChild} {...props} />;
}
