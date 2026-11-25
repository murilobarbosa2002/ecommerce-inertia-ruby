import { useSyncExternalStore } from "react";

// useSyncExternalStore, não useState+useEffect: evita o flash de "desktop"
// no primeiro render numa tela pequena — o valor já vem certo desde o
// commit inicial, lendo o estado real do browser em vez de um estado React
// que só se atualizaria depois de montar (mesmo racional de useTheme).
export default function useMediaQuery(query: string): boolean {
  function subscribe(onStoreChange: () => void) {
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener("change", onStoreChange);
    return () => {
      mediaQueryList.removeEventListener("change", onStoreChange);
    };
  }

  function getSnapshot() {
    return window.matchMedia(query).matches;
  }

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
