import { tv } from "tailwind-variants";

export const tabsList = tv({
  base: "mb-6 flex gap-1 border-b border-line",
});

// border-accent: par já validado contra surface/canvas em
// test/styles/tokens.test.ts (3:1, WCAG 1.4.11) — a aba ativa também muda a
// cor do texto (fg vs fg-muted), então a borda não é o único indicador de
// estado, mas fica validada do mesmo jeito.
export const tabsTrigger = tv({
  base: "-mb-px rounded-sm border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=active]:border-accent data-[state=active]:text-fg",
});

export const tabsContent = tv({
  base: "focus:outline-none",
});
