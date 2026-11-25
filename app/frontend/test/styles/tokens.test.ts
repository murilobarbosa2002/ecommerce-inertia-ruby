import { describe, expect, it } from "vitest";

import tokensCss from "@/styles/tokens.css?raw";

import {
  contrastRatio,
  readColorTokens,
  relativeLuminance,
} from "../helpers/contrast";

const TEXT = 4.5; // WCAG 1.4.3 — texto normal
const UI = 3; // WCAG 1.4.11 — indicador de estado de UI

// [token de primeiro plano, token de fundo, contraste mínimo]
const REQUIRED_PAIRS: [string, string, number][] = [
  ["fg", "canvas", TEXT],
  ["fg", "surface", TEXT],
  ["fg", "surface-muted", TEXT],
  ["fg-muted", "canvas", TEXT],
  ["fg-muted", "surface", TEXT],
  ["fg-muted", "surface-muted", TEXT],
  ["fg-subtle", "canvas", TEXT],
  ["fg-subtle", "surface", TEXT],
  ["fg-subtle", "surface-muted", TEXT],
  ["accent-fg", "accent", TEXT],
  ["accent-fg", "accent-hover", TEXT],
  ["accent-fg", "danger-solid", TEXT],
  ["accent-fg", "success-solid", TEXT],
  ["accent-text", "canvas", TEXT],
  ["accent-text", "surface", TEXT],
  ["accent-text", "accent-soft", TEXT],
  ["success-text", "success-soft", TEXT],
  ["warning-text", "warning-soft", TEXT],
  ["danger-text", "danger-soft", TEXT],
  // FieldError (mensagem de validação) fica direto sobre o fundo da
  // página/campo, não sobre danger-soft — par adicional exigido pela
  // migração de FieldError.variants.ts pros tokens (docs/adr/0031).
  ["danger-text", "canvas", TEXT],
  ["danger-text", "surface", TEXT],
  ["info-text", "info-soft", TEXT],
  ["focus-ring", "canvas", UI],
  ["focus-ring", "surface", UI],
  ["danger-solid", "surface", UI],
];

const themes = {
  claro: readColorTokens(tokensCss, ":root"),
  escuro: readColorTokens(tokensCss, ".dark"),
};

describe("contraste matemático (helper)", () => {
  it("preto sobre branco dá 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("é simétrico", () => {
    expect(contrastRatio("#6938ef", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#6938ef"),
      10,
    );
  });

  it("luminância de branco é 1 e de preto é 0", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 10);
    expect(relativeLuminance("#000000")).toBe(0);
  });
});

describe("tokens de cor do painel (docs/adr/0031)", () => {
  it("o tema escuro redefine exatamente os mesmos tokens do tema claro", () => {
    expect(Object.keys(themes.escuro).sort()).toEqual(
      Object.keys(themes.claro).sort(),
    );
  });

  it("cada token de cor vira utilitário do Tailwind via @theme inline", () => {
    for (const name of Object.keys(themes.claro)) {
      expect(tokensCss).toContain(`--color-${name}: var(--${name});`);
    }
  });

  for (const [themeName, tokens] of Object.entries(themes)) {
    describe(`tema ${themeName}`, () => {
      it.each(REQUIRED_PAIRS)(
        "%s sobre %s atinge contraste mínimo de %s",
        (foreground, background, minimum) => {
          expect(foreground in tokens).toBe(true);
          expect(background in tokens).toBe(true);
          expect(
            contrastRatio(tokens[foreground], tokens[background]),
          ).toBeGreaterThanOrEqual(minimum);
        },
      );
    });
  }
});
