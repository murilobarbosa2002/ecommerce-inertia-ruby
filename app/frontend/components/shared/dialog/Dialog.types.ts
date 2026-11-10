import { type ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  // Opcional: sem isso, o Radix não tem como montar aria-describedby — o
  // texto descritivo só ficaria no fluxo de leitura visual, sem ser
  // anunciado como descrição do diálogo pra quem usa leitor de tela.
  description?: string;
  children: ReactNode;
}
