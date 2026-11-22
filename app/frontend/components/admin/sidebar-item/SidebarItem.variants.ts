import { tv } from "tailwind-variants";

export const sidebarItem = tv({
  base: "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  variants: {
    active: {
      true: "bg-accent-soft text-accent-text",
      false: "text-fg-muted hover:bg-surface-muted hover:text-fg",
    },
    collapsed: {
      true: "mx-auto size-10 justify-center p-0",
    },
  },
  defaultVariants: {
    active: false,
  },
});
