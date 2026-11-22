import { tv } from "tailwind-variants";

export const dropdownMenuItem = tv({
  base: "flex cursor-pointer items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50",
  variants: {
    tone: {
      default: "text-fg data-highlighted:bg-surface-muted",
      danger: "text-danger-text data-highlighted:bg-danger-soft",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});
