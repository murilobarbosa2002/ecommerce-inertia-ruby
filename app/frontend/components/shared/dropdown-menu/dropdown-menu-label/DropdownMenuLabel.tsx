import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuLabelProps } from "./DropdownMenuLabel.types";
import { dropdownMenuLabel } from "./DropdownMenuLabel.variants";

export default function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <RadixDropdownMenu.Label
      className={dropdownMenuLabel({ className })}
      {...props}
    />
  );
}
