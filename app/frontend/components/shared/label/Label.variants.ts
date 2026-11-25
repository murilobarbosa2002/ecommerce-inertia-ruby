import { tv } from "tailwind-variants";

export const label = tv({
  // select-none: rótulo de campo é chrome de formulário, não conteúdo pra
  // selecionar — mesmo racional do Button (achado real testando no browser).
  base: "mb-1.5 block text-sm font-medium text-fg-muted select-none",
});
