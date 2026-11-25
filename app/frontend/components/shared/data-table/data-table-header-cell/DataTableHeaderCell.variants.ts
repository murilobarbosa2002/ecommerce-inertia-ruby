import { tv } from "tailwind-variants";

export const dataTableHeaderCell = tv({
  slots: {
    th: "px-4 py-2 font-medium text-fg-muted",
    button:
      "inline-flex cursor-pointer items-center gap-1 rounded-control select-none hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
  },
  variants: {
    align: {
      start: { th: "text-left" },
      end: { th: "text-right" },
    },
  },
  defaultVariants: {
    align: "start",
  },
});
