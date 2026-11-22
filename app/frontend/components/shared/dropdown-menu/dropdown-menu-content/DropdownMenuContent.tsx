import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { type DropdownMenuContentProps } from "./DropdownMenuContent.types";
import { dropdownMenuContent } from "./DropdownMenuContent.variants";

export default function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={sideOffset}
        align={align}
        className={dropdownMenuContent({ className })}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}
