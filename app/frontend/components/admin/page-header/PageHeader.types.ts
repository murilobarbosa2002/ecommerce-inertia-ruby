import { type ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  // Ação no canto (ex. botão "Novo admin") — opcional, pra página que não
  // tem nenhuma ação de topo continuar simples.
  action?: ReactNode;
}
