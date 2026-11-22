import { type ActiveNavItem, type NavSection } from "./navigation.types";

function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}

function matches(currentPath: string, basePath: string): boolean {
  // A raiz ("/") é prefixo de toda URL: só casa exata, senão o item do
  // painel ficaria ativo em qualquer página.
  if (basePath === "/") return currentPath === "/";
  return currentPath === basePath || currentPath.startsWith(`${basePath}/`);
}

// Item de navegação que corresponde à URL atual. Se mais de um casar (ex. um
// caminho-base dentro de outro), vence o mais específico (o mais longo).
export default function findActiveNavItem(
  sections: NavSection[],
  currentUrl: string,
): ActiveNavItem | null {
  const currentPath = pathOf(currentUrl);
  let best: (ActiveNavItem & { length: number }) | null = null;

  for (const section of sections) {
    for (const item of section.items) {
      const basePath = pathOf((item.activePath ?? item.href)());
      if (!matches(currentPath, basePath)) continue;
      if (!best || basePath.length > best.length) {
        best = { section, item, length: basePath.length };
      }
    }
  }

  return best ? { section: best.section, item: best.item } : null;
}
