import { type ReactElement, type ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  // O elemento que dispara o tooltip (recebe os handlers de hover/foco).
  children: ReactElement;
}
