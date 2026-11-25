import { tv } from "tailwind-variants";

export const confirmDialogOverlay = tv({
  base: "fixed inset-0 z-50 bg-black/50",
});

export const confirmDialogContent = tv({
  base: "fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-1/2 rounded-card border border-line bg-surface p-6 shadow-popover focus:outline-none",
});
