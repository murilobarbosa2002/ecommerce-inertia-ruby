import { type ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  // Opcional: sem isso, o Radix não tem como montar aria-describedby — o
  // texto descritivo só ficaria no fluxo de leitura visual, sem ser
  // anunciado como descrição do diálogo pra quem usa leitor de tela.
  description?: string;
  children: ReactNode;
  // Sem isso, o diálogo não é fechável (comportamento original, pensado
  // pro aviso obrigatório de 2FA) — Esc/clique fora/X ficam desabilitados.
  // Com onOpenChange, o diálogo vira fechável por qualquer um dos três.
  onOpenChange?: (open: boolean) => void;
}
