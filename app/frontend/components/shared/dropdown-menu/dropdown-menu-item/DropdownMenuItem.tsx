import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuItemProps } from "./DropdownMenuItem.types";
import { dropdownMenuItem } from "./DropdownMenuItem.variants";

export default function DropdownMenuItem({
  className,
  tone,
  ...props
}: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      className={dropdownMenuItem({ tone, className })}
      {...props}
    />
  );
}
