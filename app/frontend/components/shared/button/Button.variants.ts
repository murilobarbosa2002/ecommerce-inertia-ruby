import { tv } from "tailwind-variants";

export const button = tv({
  // select-none: texto de botão é ação, não conteúdo pra selecionar/copiar —
  // sem isso, clicar perto do texto mostra o cursor nativo de seleção do
  // navegador, dando impressão de campo editável.
  // Foco: anel de 2px na cor cheia do token (3:1 contra o fundo, validado em
  // test/styles/tokens.test.ts) com offset, em vez de um halo translúcido.
  base: "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    intent: {
      primary: "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover",
      secondary: "bg-surface-muted text-fg hover:bg-line",
      outline:
        "border border-line-strong bg-surface text-fg hover:bg-surface-muted",
      danger: "bg-danger-solid text-accent-fg shadow-sm hover:brightness-90",
      // Ação inline discreta (ex. "Sair", "Copiar") — sem fundo até o hover.
      ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      // Botão só com ícone: quadrado, sem padding horizontal.
      icon: "size-10 p-0 text-sm",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
});
