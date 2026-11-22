// Apoio de teste: lê tokens de cor de um bloco CSS e calcula contraste WCAG.
// Fica em test/ (não em lib/) porque nenhum código de produção usa isso.

export type TokenMap = Record<string, string>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Extrai as declarações `--nome: #rrggbb;` de um bloco `<seletor> { ... }`.
// Aceita só hexadecimal de 6 dígitos — o mesmo formato que tokens.css
// promete, pra o cálculo de contraste nunca depender de um valor que este
// helper não sabe interpretar.
export function readColorTokens(css: string, selector: string): TokenMap {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`Bloco "${selector}" não encontrado`);

  const tokens: TokenMap = {};
  for (const match of block[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const value = match[2].trim();
    if (HEX_COLOR.test(value)) tokens[match[1]] = value.toLowerCase();
  }
  return tokens;
}

function channel(hex: string, start: number): number {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  return (
    0.2126 * channel(hex, 1) +
    0.7152 * channel(hex, 3) +
    0.0722 * channel(hex, 5)
  );
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (lighter + 0.05) / (darker + 0.05);
}
