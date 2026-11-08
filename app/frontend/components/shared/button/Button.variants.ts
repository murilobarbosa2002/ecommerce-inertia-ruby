import { tv } from "tailwind-variants";

export const button = tv({
  // select-none: texto de botão é ação, não conteúdo pra selecionar/copiar —
  // sem isso, clicar perto do texto mostra o cursor nativo de seleção do
  // navegador, dando impressão de campo editável.
  base: "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    intent: {
      // Botão de submit de formulário — largura cheia, cor sólida.
      primary:
        "w-full shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
      // Ação secundária inline (ex. "Sair" na navegação do painel) — sem
      // fundo, sem largura forçada, só texto.
      ghost:
        "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});
