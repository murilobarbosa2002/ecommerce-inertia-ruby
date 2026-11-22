import { type ReactNode } from "react";

export interface TopbarProps {
  breadcrumbs: string[];
  // Botão de menu do mobile, à esquerda do breadcrumb.
  leading?: ReactNode;
  // Ações do lado direito (tema, menu do usuário).
  children?: ReactNode;
}
