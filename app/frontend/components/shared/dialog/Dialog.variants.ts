import { tv } from "tailwind-variants";

export const dialogOverlay = tv({
  base: "fixed inset-0 bg-black/50",
});

export const dialogContent = tv({
  base: "fixed top-1/2 left-1/2 w-full max-w-sm -translate-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl focus:outline-none dark:border-gray-800 dark:bg-gray-900",
});
