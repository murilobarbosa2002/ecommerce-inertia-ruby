import { type NavSection } from "./navigation.types";

// Só os itens que o admin pode ver (sem permissão exigida, ou com ela no
// papel dele); seção que fica sem nenhum item some inteira.
export default function filterNavigation(
  sections: NavSection[],
  permissions: string[],
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || permissions.includes(item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
