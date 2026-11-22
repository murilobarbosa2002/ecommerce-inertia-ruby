import { type NavSection } from "@/lib/navigation/navigation.types";

export interface SidebarNavProps {
  // Seções já filtradas pelas permissões do admin.
  sections: NavSection[];
  activeItemKey: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
}
