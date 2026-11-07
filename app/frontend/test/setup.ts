import "@testing-library/jest-dom/vitest";
import "@/i18n";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react não limpa o DOM entre exemplos sozinho — depende de
// detectar o framework de teste automaticamente, o que não acontece com a
// configuração atual do Vitest (sem `test.globals: true`). Sem isso, um
// `describe` com múltiplos `render()` em `it`s diferentes acumula elementos
// de execuções anteriores no mesmo `document.body` (bug real encontrado
// escrevendo o primeiro teste com mais de um `render()` no mesmo arquivo).
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
