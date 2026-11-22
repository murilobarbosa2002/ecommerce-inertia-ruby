import { type ParseKeys } from "i18next";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  labelKey: ParseKeys;
  icon: LucideIcon;
  href: () => string;
  // Caminho-base que marca o item como ativo (ex. a tela de edição fica em
  // `<base>/edit`). Sem isso, usa o próprio href.
  activePath?: () => string;
  // Permissão exigida pra o item aparecer. Sem isso, todo admin vê.
  permission?: string;
}

export interface NavSection {
  key: string;
  labelKey: ParseKeys;
  items: NavItem[];
}

export interface ActiveNavItem {
  section: NavSection;
  item: NavItem;
}
