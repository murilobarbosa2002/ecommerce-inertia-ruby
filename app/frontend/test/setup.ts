import "@testing-library/jest-dom/vitest";
import "@/i18n";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Detecção automática de framework não ativa sem `test.globals: true` —
// sem isso, DOM de um teste vaza pro próximo `render()` do mesmo arquivo.
afterEach(() => {
  cleanup();
});

// jsdom não implementa essas APIs de browser, mas o Radix UI (Checkbox, Dialog,
// Select, Popover, etc.) assume que elas existem e quebram no mount sem isso.
// O tipo do lib.dom.d.ts assume ambiente de browser completo (por isso o uso de
// `typeof`/`in` em vez de `??=` direto — o TypeScript não aceita a possibilidade
// de ausência que só existe de fato no jsdom). Os stubs são no-op de propósito,
// só preenchendo a API pra não quebrar o mount; não há comportamento real a
// implementar aqui.
/* eslint-disable @typescript-eslint/no-empty-function */
if (typeof window.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver = ResizeObserverStub;
}

if (typeof Element.prototype.hasPointerCapture !== "function") {
  Element.prototype.hasPointerCapture = function (): boolean {
    return false;
  };
}
if (typeof Element.prototype.setPointerCapture !== "function") {
  Element.prototype.setPointerCapture = function (): void {};
}
if (typeof Element.prototype.releasePointerCapture !== "function") {
  Element.prototype.releasePointerCapture = function (): void {};
}
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = function (): void {};
}
/* eslint-enable @typescript-eslint/no-empty-function */

// jsdom também não implementa matchMedia (useMediaQuery, ex. Popover
// drawerOnMobile) — stub sempre "não corresponde" (desktop) por padrão;
// um teste que precisa simular mobile sobrescreve window.matchMedia só
// nele (ex. test/components/shared/popover/Popover.test.tsx).
if (typeof window.matchMedia !== "function") {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- stub
  const noop = (): void => {};
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList exige, mesmo deprecated
    addListener: noop,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList exige, mesmo deprecated
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  });
}
