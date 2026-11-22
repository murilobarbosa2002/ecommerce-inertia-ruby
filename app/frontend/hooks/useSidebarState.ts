import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sidebar-collapsed";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

// localStorage pode lançar (modo privado, cota, armazenamento bloqueado) —
// a sidebar só perde a preferência salva, nunca quebra a página.
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {
    // sem persistência; o estado desta sessão ainda vale via notificação
  }
  listeners.forEach((listener) => {
    listener();
  });
}

// Preferência de sidebar recolhida, persistida no navegador. Sem Provider,
// pelo mesmo motivo de useTheme (docs/adr/0020): qualquer componente lê o
// mesmo estado sem embrulhar a árvore.
export default function useSidebarState() {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  const toggleCollapsed = useCallback(() => {
    writeCollapsed(!readCollapsed());
  }, []);

  return { collapsed, toggleCollapsed };
}
