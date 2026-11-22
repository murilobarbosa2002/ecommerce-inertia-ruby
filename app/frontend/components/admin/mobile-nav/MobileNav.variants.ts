import { tv } from "tailwind-variants";

export const mobileNav = tv({
  slots: {
    overlay: "fixed inset-0 z-40 bg-black/50 lg:hidden",
    content:
      "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface shadow-popover focus:outline-none lg:hidden",
  },
});
