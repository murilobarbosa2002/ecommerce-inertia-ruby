import { tv } from "tailwind-variants";

export const banner = tv({
  base: "mb-5 flex items-start gap-2.5 rounded-lg border p-3.5 text-sm",
  variants: {
    tone: {
      notice: "border-green-200 bg-green-50 text-green-800",
      alert: "border-red-200 bg-red-50 text-red-800",
    },
  },
});
