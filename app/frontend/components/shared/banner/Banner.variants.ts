import { tv } from "tailwind-variants";

export const banner = tv({
  base: "mb-5 flex items-start gap-2.5 rounded-control border p-3.5 text-sm",
  variants: {
    tone: {
      notice: "border-success-text/30 bg-success-soft text-success-text",
      alert: "border-danger-text/30 bg-danger-soft text-danger-text",
    },
  },
});
