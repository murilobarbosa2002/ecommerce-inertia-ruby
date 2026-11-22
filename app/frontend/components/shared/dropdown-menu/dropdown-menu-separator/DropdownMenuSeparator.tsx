import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuSeparatorProps } from "./DropdownMenuSeparator.types";
import { dropdownMenuSeparator } from "./DropdownMenuSeparator.variants";

export default function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <RadixDropdownMenu.Separator
      className={dropdownMenuSeparator({ className })}
      {...props}
    />
  );
}
