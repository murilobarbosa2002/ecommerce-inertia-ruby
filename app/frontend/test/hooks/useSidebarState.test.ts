import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useSidebarState from "@/hooks/useSidebarState";

describe("useSidebarState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("começa expandida quando não há preferência salva", () => {
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);
  });

  it("começa recolhida quando a preferência salva é essa", () => {
    localStorage.setItem("sidebar-collapsed", "true");

    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(true);
  });

  it("alterna e persiste a preferência", () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.toggleCollapsed();
    });
    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");

    act(() => {
      result.current.toggleCollapsed();
    });
    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem("sidebar-collapsed")).toBe("false");
  });

  it("sincroniza duas instâncias do hook sem Provider", () => {
    const first = renderHook(() => useSidebarState());
    const second = renderHook(() => useSidebarState());

    act(() => {
      first.result.current.toggleCollapsed();
    });

    expect(second.result.current.collapsed).toBe(true);
  });

  it("não quebra quando o localStorage lança (modo privado, bloqueado)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });

    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);
    expect(() => {
      act(() => {
        result.current.toggleCollapsed();
      });
    }).not.toThrow();
  });
});
