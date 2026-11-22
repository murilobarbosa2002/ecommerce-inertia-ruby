import { tv } from "tailwind-variants";

export const badge = tv({
  base: "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
  variants: {
    tone: {
      neutral: "bg-surface-muted text-fg-muted",
      brand: "bg-accent-soft text-accent-text",
      success: "bg-success-soft text-success-text",
      warning: "bg-warning-soft text-warning-text",
      danger: "bg-danger-soft text-danger-text",
      info: "bg-info-soft text-info-text",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    tone: "neutral",
    size: "sm",
  },
});
