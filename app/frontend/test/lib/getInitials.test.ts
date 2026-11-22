import { describe, expect, it } from "vitest";

import getInitials from "@/lib/getInitials";

describe("getInitials", () => {
  it("usa a primeira letra do primeiro e do último nome", () => {
    expect(getInitials("Ana Maria Souza")).toBe("AS");
  });

  it("converte e-mail em iniciais, ignorando o domínio", () => {
    expect(getInitials("ana.souza@loja.com")).toBe("AS");
  });

  it("separa o e-mail também por hífen e underscore", () => {
    expect(getInitials("joao_pedro-lima@x.com")).toBe("JL");
  });

  it("uma palavra só dá as duas primeiras letras", () => {
    expect(getInitials("admin@loja.com")).toBe("AD");
    expect(getInitials("Maria")).toBe("MA");
  });

  it("devolve ? quando não há nada aproveitável", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
    expect(getInitials("@loja.com")).toBe("?");
  });

  it("devolve sempre maiúsculas", () => {
    expect(getInitials("ana souza")).toBe("AS");
  });
});
