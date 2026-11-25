import { tv } from "tailwind-variants";

export const input = tv({
  // [&::-webkit-search-cancel-button] remove o X nativo de type="search"
  // (Chrome/Safari) — sem isso ele ignora qualquer cor/token do projeto,
  // sempre azul/preto padrão do navegador, mesmo no tema escuro.
  // Tokens semânticos (docs/adr/0031), trocam sozinhos entre os temas — sem
  // dark: repetido. focus-visible:ring-2 ring-focus-ring é o mesmo
  // tratamento de foco já usado em MultiSelect/Button, não o glow de
  // ring-4/10 do design antigo.
  base: "block w-full rounded-control border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm transition-colors placeholder:text-fg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&::-webkit-search-cancel-button]:appearance-none",
  variants: {
    // border-danger-solid, não danger-text: é a borda em si (indicador de
    // estado de UI, WCAG 1.4.11, mínimo 3:1), não texto — danger-solid é o
    // par já validado contra `surface` em test/styles/tokens.test.ts.
    invalid: {
      true: "border-danger-solid focus-visible:ring-danger-solid",
    },
  },
});
