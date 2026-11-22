import { type ComponentPropsWithoutRef } from "react";
import { type DropdownMenu } from "radix-ui";
import { type VariantProps } from "tailwind-variants";

import { type dropdownMenuItem } from "./DropdownMenuItem.variants";

export type DropdownMenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenu.Item
> &
  VariantProps<typeof dropdownMenuItem>;
