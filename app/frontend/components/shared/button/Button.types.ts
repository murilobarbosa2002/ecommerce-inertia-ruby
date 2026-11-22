import { type ButtonHTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";

import { type button } from "./Button.variants";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    // Mostra um spinner e desabilita o botão (sem perder o rótulo, pra o
    // tamanho não pular durante o envio).
    loading?: boolean;
  };
