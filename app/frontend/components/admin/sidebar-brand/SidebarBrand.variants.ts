import { tv } from "tailwind-variants";

export const sidebarBrand = tv({
  slots: {
    root: "flex h-16 shrink-0 items-center gap-3 px-4",
    mark: "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-control bg-accent text-accent-fg",
    name: "truncate text-sm font-semibold text-fg",
  },
  variants: {
    collapsed: {
      true: { root: "justify-center px-0" },
    },
    bordered: {
      true: { root: "border-b border-line" },
    },
  },
});
