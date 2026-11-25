import { tv } from "tailwind-variants";

export const dataTable = tv({
  slots: {
    root: "overflow-hidden rounded-card border border-line shadow-card",
    table: "w-full border-collapse text-left text-sm",
    thead: "bg-surface-muted",
    tbody: "divide-y divide-line bg-surface",
    td: "px-4 py-3 text-fg",
  },
});
