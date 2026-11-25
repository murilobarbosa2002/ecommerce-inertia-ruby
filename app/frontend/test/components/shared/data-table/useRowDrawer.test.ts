import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useRowDrawer from "@/components/shared/data-table/useRowDrawer";

interface Row {
  id: number;
  email: string;
}

const rows: Row[] = [
  { id: 1, email: "ana@example.com" },
  { id: 2, email: "bruno@example.com" },
];

describe("useRowDrawer", () => {
  it("começa sem nenhuma linha aberta", () => {
    const { result } = renderHook(() =>
      useRowDrawer(rows, (row: Row) => row.id),
    );

    expect(result.current.openRow).toBeNull();
  });

  it("abre a linha pedida", () => {
    const { result } = renderHook(() =>
      useRowDrawer(rows, (row: Row) => row.id),
    );

    act(() => {
      result.current.openDrawer(rows[1]);
    });

    expect(result.current.openRow).toEqual(rows[1]);
  });

  it("fecha a linha aberta", () => {
    const { result } = renderHook(() =>
      useRowDrawer(rows, (row: Row) => row.id),
    );

    act(() => {
      result.current.openDrawer(rows[0]);
    });
    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.openRow).toBeNull();
  });

  it("sobrevive a troca de identidade do array de rows, desde que a chave continue existindo", () => {
    const { result, rerender } = renderHook(
      ({ currentRows }: { currentRows: Row[] }) =>
        useRowDrawer(currentRows, (row: Row) => row.id),
      { initialProps: { currentRows: rows } },
    );

    act(() => {
      result.current.openDrawer(rows[0]);
    });

    const reloadedRows: Row[] = [
      { id: 1, email: "ana-atualizada@example.com" },
      { id: 2, email: "bruno@example.com" },
    ];
    rerender({ currentRows: reloadedRows });

    expect(result.current.openRow).toEqual(reloadedRows[0]);
  });
});
