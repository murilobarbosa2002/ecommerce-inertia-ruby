import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

// Lê a classe real da <html>, já aplicada pelo script inline em
// application.html.erb antes do primeiro paint (docs/adr/0020) — não há
// estado React próprio, pra nunca divergir do que está de fato na tela.
function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((listener) => {
    listener();
  });
}

export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggleTheme };
}
