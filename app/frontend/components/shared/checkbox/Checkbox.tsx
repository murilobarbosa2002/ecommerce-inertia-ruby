import { Checkbox as RadixCheckbox } from "radix-ui";

import { type CheckboxProps } from "./Checkbox.types";
import { checkbox } from "./Checkbox.variants";

export default function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <RadixCheckbox.Root className={checkbox({ className })} {...props}>
      <RadixCheckbox.Indicator className="text-white">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
