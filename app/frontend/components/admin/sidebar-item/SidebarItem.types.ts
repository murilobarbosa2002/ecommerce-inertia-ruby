import { type LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  // Recolhido mostra só o ícone; o rótulo continua como nome acessível e
  // aparece num tooltip.
  collapsed?: boolean;
  onNavigate?: () => void;
}
