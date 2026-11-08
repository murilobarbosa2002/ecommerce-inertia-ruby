import { tv } from "tailwind-variants";

export const link = tv({
  // select-none: link de navegação interna do painel é ação (muda de
  // página), não texto de conteúdo pra selecionar — mesmo racional do
  // Button/Label (achado real testando no browser).
  base: "font-medium text-indigo-600 transition-colors select-none hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300",
});
