import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import useTheme from "@/hooks/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("lê o tema inicial a partir da classe já aplicada na <html>", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("alterna de light pra dark, aplicando a classe e persistindo em localStorage", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("alterna de volta pra light, removendo a classe e persistindo", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("mantém duas instâncias do hook sincronizadas sem Context", () => {
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => {
      first.result.current.toggleTheme();
    });

    expect(second.result.current.theme).toBe("dark");
  });
});
