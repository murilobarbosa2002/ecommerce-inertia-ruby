import { tv } from "tailwind-variants";

export const separator = tv({
  base: "shrink-0 bg-line",
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});
