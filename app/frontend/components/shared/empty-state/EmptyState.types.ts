import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  // Nível do título na página, pra não quebrar a hierarquia de headings.
  titleAs?: "h2" | "h3" | "h4";
  // Ação principal (ex. um botão "Criar o primeiro").
  children?: ReactNode;
  className?: string;
}
