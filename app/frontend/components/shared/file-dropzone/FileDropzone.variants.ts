import { tv } from "tailwind-variants";

export const dropzone = tv({
  // has-[:focus-visible]: o input de arquivo real fica sr-only (não
  // display:none) justamente pra continuar focável/acionável por teclado —
  // sem isso, navegar até ele via Tab não mostraria indicação visual
  // nenhuma de foco.
  base: "flex flex-col items-center gap-2 rounded-control border-2 border-dashed border-line-strong bg-surface p-6 text-center transition-colors hover:border-accent has-focus-visible:ring-2 has-focus-visible:ring-focus-ring",
  variants: {
    dragging: {
      true: "border-accent bg-surface-muted",
    },
    invalid: {
      true: "border-danger-solid",
    },
  },
});
