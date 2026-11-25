import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { routerReloadMock } = vi.hoisted(() => ({
  routerReloadMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  router: { reload: routerReloadMock },
}));

import useDataTable from "@/components/shared/data-table/useDataTable";

describe("useDataTable", () => {
  it("muda a busca, volta pra página 1 e recarrega só a prop pedida", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["admins"], paramPrefix: "admins" }),
    );

    act(() => {
      result.current.changeSearch("ana");
    });

    expect(result.current.search).toBe("ana");
    expect(routerReloadMock).toHaveBeenCalledWith({
      only: ["admins"],
      data: {
        admins_page: 1,
        admins_search: "ana",
        admins_sort: "",
        admins_direction: "",
      },
      onFinish: expect.any(Function) as () => void,
    });
  });

  it("ordena por uma coluna nova em ordem ascendente, voltando pra página 1", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["admins"], paramPrefix: "admins" }),
    );

    act(() => {
      result.current.changeSort("email_address");
    });

    expect(result.current.sort).toEqual({
      column: "email_address",
      direction: "asc",
    });
    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          admins_page: 1,
          admins_sort: "email_address",
          admins_direction: "asc",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("alterna pra ordem descendente ao clicar de novo na mesma coluna", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["admins"], paramPrefix: "admins" }),
    );

    act(() => {
      result.current.changeSort("email_address");
    });
    act(() => {
      result.current.changeSort("email_address");
    });

    expect(result.current.sort).toEqual({
      column: "email_address",
      direction: "desc",
    });
  });

  it("muda de página sem alterar busca/ordenação atuais", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["admins"], paramPrefix: "admins" }),
    );

    act(() => {
      result.current.changeSearch("ana");
    });
    routerReloadMock.mockClear();

    act(() => {
      result.current.changePage(2);
    });

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          admins_page: 2,
          admins_search: "ana",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("persiste filtros extras (reload com extra) em recargas seguintes", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["audit_events"], paramPrefix: "audit_events" }),
    );

    act(() => {
      result.current.reload({
        page: 1,
        extra: { audit_events_actor_id: "7" },
      });
    });
    routerReloadMock.mockClear();

    act(() => {
      result.current.changeSearch("ana");
    });

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          audit_events_search: "ana",
          audit_events_actor_id: "7",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("mescla um novo extra com o que já estava persistido, sem perder chaves antigas", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["audit_events"], paramPrefix: "audit_events" }),
    );

    act(() => {
      result.current.reload({
        page: 1,
        extra: { audit_events_actor_id: "7" },
      });
    });
    act(() => {
      result.current.reload({
        page: 1,
        extra: { audit_events_from: "2026-01-01" },
      });
    });

    expect(routerReloadMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          audit_events_actor_id: "7",
          audit_events_from: "2026-01-01",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("liga isLoading durante o reload e desliga quando ele termina", () => {
    const { result } = renderHook(() =>
      useDataTable({ only: ["admins"], paramPrefix: "admins" }),
    );

    act(() => {
      result.current.changePage(2);
    });
    expect(result.current.isLoading).toBe(true);

    const { onFinish } = routerReloadMock.mock.calls[0][0] as {
      onFinish: () => void;
    };
    act(() => {
      onFinish();
    });
    expect(result.current.isLoading).toBe(false);
  });
});
