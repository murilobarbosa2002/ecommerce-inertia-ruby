import { tv } from "tailwind-variants";

export const skeleton = tv({
  base: "animate-pulse rounded-control bg-surface-muted motion-reduce:animate-none",
  variants: {
    shape: {
      block: "",
      circle: "rounded-full",
    },
  },
  defaultVariants: {
    shape: "block",
  },
});
