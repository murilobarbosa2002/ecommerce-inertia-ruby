import { tv } from "tailwind-variants";

export const link = tv({
  // select-none: link de navegação interna do painel é ação (muda de
  // página), não texto de conteúdo pra selecionar — mesmo racional do
  // Button/Label (achado real testando no browser).
  base: "font-medium text-accent-text underline-offset-4 transition-colors select-none hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-focus-ring",
});
