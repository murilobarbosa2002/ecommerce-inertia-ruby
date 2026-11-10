import { tv } from "tailwind-variants";

export const input = tv({
  base: "block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
  variants: {
    // border-red-500 (não red-300/red-700) nos dois modos — contraste real
    // contra o fundo do campo: red-300 só dava 1.90:1 contra branco e
    // red-700 só 2.27:1 contra gray-800 (fundo do input no dark mode),
    // abaixo do mínimo de 3:1 que WCAG 1.4.11 exige pra um indicador de
    // estado de UI (não é texto, é a borda em si). red-500 passa nos dois
    // (3.76:1 claro, 3.90:1 escuro) — mesmo tom já usado no estado de foco,
    // agora consistente também no estado de repouso.
    invalid: {
      true: "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500",
    },
  },
});
