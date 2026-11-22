import { tv } from "tailwind-variants";

export const sidebar = tv({
  // Só desktop: no mobile a navegação vem pelo drawer (MobileNav).
  base: "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:flex",
  variants: {
    collapsed: {
      true: "w-18",
      false: "w-64",
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});
