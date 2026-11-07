import { tv } from "tailwind-variants";

export const button = tv({
  base: "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    intent: {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});
