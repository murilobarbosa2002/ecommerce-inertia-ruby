import { tv } from "tailwind-variants";

export const avatarRoot = tv({
  base: "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent-text select-none",
  variants: {
    size: {
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-14 text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
