import { describe, expect, it, vi } from "vitest";

import generatePassword from "@/lib/generatePassword";

describe("generatePassword", () => {
  it("gera uma senha com o tamanho exato pedido", () => {
    const password = generatePassword({
      length: 20,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialCharacters: false,
    });

    expect(password).toHaveLength(20);
  });

  it("usa só minúsculas quando nenhuma opção extra está marcada", () => {
    const password = generatePassword({
      length: 50,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialCharacters: false,
    });

    expect(password).toMatch(/^[a-z]+$/);
  });

  it("inclui maiúsculas quando includeUppercase é true", () => {
    const password = generatePassword({
      length: 200,
      includeUppercase: true,
      includeNumbers: false,
      includeSpecialCharacters: false,
    });

    expect(password).toMatch(/[A-Z]/);
  });

  it("inclui números quando includeNumbers é true", () => {
    const password = generatePassword({
      length: 200,
      includeUppercase: false,
      includeNumbers: true,
      includeSpecialCharacters: false,
    });

    expect(password).toMatch(/[0-9]/);
  });

  it("inclui caracteres especiais quando includeSpecialCharacters é true", () => {
    const password = generatePassword({
      length: 200,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialCharacters: true,
    });

    expect(password).toMatch(/[^a-zA-Z0-9]/);
  });

  it("usa crypto.getRandomValues (aleatoriedade segura), não Math.random", () => {
    const spy = vi.spyOn(crypto, "getRandomValues");

    generatePassword({
      length: 10,
      includeUppercase: true,
      includeNumbers: true,
      includeSpecialCharacters: true,
    });

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
