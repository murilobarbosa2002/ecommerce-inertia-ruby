import { tv } from "tailwind-variants";

// Variantes compartilhadas pelas páginas pré-autenticação do admin
// (docs/adr/0012). Sem Radix UI: nenhum desses campos tem comportamento.

export const label = tv({
  base: "mb-1.5 block text-sm font-medium text-gray-700",
});

export const input = tv({
  base: "block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none",
  variants: {
    invalid: {
      true: "border-red-300 focus:border-red-500 focus:ring-red-500/10",
    },
  },
});

export const fieldError = tv({
  base: "mt-1.5 text-sm text-red-600",
});

export const button = tv({
  base: "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    intent: {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export const link = tv({
  base: "font-medium text-indigo-600 transition-colors hover:text-indigo-500",
});

export const banner = tv({
  base: "mb-5 flex items-start gap-2.5 rounded-lg border p-3.5 text-sm",
  variants: {
    tone: {
      notice: "border-green-200 bg-green-50 text-green-800",
      alert: "border-red-200 bg-red-50 text-red-800",
    },
  },
});
