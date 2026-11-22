import { tv } from "tailwind-variants";

export const emptyState = tv({
  slots: {
    root: "flex flex-col items-center justify-center px-6 py-12 text-center",
    iconWrapper:
      "mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-text",
    title: "text-base font-semibold text-fg",
    description: "mt-1 max-w-sm text-sm text-fg-muted",
    actions: "mt-5 flex items-center gap-3",
  },
});
