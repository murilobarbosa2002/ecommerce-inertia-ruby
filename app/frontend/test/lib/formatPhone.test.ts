import { describe, expect, it } from "vitest";

import formatPhone from "@/lib/formatPhone";

describe("formatPhone", () => {
  it("formata DDD + 9 dígitos", () => {
    expect(formatPhone("11988887777")).toBe("(11) 98888-7777");
  });

  it("mostra um traço quando não há celular", () => {
    expect(formatPhone(null)).toBe("—");
  });
});
