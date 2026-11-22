import { type NavSection } from "@/lib/navigation/navigation.types";

export interface SidebarProps {
  sections: NavSection[];
  activeItemKey: string | null;
  brandName: string;
  logoUrl: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}
