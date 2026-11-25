import { tv } from "tailwind-variants";

export const selectTrigger = tv({
  base: "flex w-full items-center justify-between gap-2 rounded-control border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
});

export const selectContent = tv({
  base: "overflow-hidden rounded-control border border-line bg-surface shadow-popover",
});

export const selectItem = tv({
  base: "cursor-pointer px-3.5 py-2 text-sm text-fg outline-none data-highlighted:bg-surface-muted",
});
