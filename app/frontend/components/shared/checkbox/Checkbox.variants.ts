import { tv } from "tailwind-variants";

export const checkbox = tv({
  base: "flex size-5 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=checked]:border-accent data-[state=checked]:bg-accent",
});
