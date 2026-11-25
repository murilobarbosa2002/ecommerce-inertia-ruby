import { tv } from "tailwind-variants";

export const drawerOverlay = tv({
  base: "fixed inset-0 z-50 bg-black/50",
});

export const drawerContent = tv({
  base: "fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-card border-t border-line bg-surface p-6 shadow-popover focus:outline-none",
});
