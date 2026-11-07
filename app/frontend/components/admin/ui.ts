import { tv } from "tailwind-variants";

// Variantes específicas do admin, sem componente próprio ainda (docs/adr/0019)
// — link/banner não são primitivo de formulário, ficam fora de
// components/shared/. Sem Radix UI: nenhum desses campos tem comportamento.

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
