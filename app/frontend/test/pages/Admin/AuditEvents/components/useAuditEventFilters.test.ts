import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AUDIT_EVENT_TYPES } from "@/lib/audit-events/auditEventTypes";
import useAuditEventFilters from "@/pages/Admin/AuditEvents/components/useAuditEventFilters";

describe("useAuditEventFilters", () => {
  it("começa com todos os 17 tipos selecionados, sem filtro de usuário/período", () => {
    const { result } = renderHook(() =>
      useAuditEventFilters({ reload: vi.fn() }),
    );

    expect(result.current.eventTypes).toEqual([...AUDIT_EVENT_TYPES]);
    expect(result.current.actorIds).toEqual([]);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("muda o tipo de evento e volta pra página 1", () => {
    const reload = vi.fn();
    const { result } = renderHook(() => useAuditEventFilters({ reload }));

    act(() => {
      result.current.changeEventTypes(["login_succeeded"]);
    });

    expect(result.current.eventTypes).toEqual(["login_succeeded"]);
    expect(result.current.activeFilterCount).toBe(1);
    expect(reload).toHaveBeenCalledWith({
      page: 1,
      extra: expect.objectContaining({
        audit_events_event_types: "login_succeeded",
      }) as Record<string, unknown>,
    });
  });

  it("muda os usuários selecionados (múltiplos), mantendo os outros filtros no mesmo reload", () => {
    const reload = vi.fn();
    const { result } = renderHook(() => useAuditEventFilters({ reload }));

    act(() => {
      result.current.changeActors(["7", "9"]);
    });

    expect(result.current.actorIds).toEqual(["7", "9"]);
    expect(result.current.activeFilterCount).toBe(1);
    expect(reload).toHaveBeenCalledWith({
      page: 1,
      extra: expect.objectContaining({
        audit_events_actor_ids: "7,9",
        audit_events_event_types: [...AUDIT_EVENT_TYPES].join(","),
      }) as Record<string, unknown>,
    });
  });

  it("muda o período, combinando data e hora num timestamp", () => {
    const reload = vi.fn();
    const { result } = renderHook(() => useAuditEventFilters({ reload }));

    act(() => {
      result.current.changePeriod({
        from: "2026-01-01",
        to: "2026-01-31",
        fromTime: "08:00",
        toTime: "",
      });
    });

    expect(reload).toHaveBeenCalledWith({
      page: 1,
      extra: expect.objectContaining({
        audit_events_from: "2026-01-01T08:00",
        audit_events_to: "2026-01-31T23:59",
      }) as Record<string, unknown>,
    });
  });

  it("limpa todos os filtros de volta ao padrão", () => {
    const reload = vi.fn();
    const { result } = renderHook(() => useAuditEventFilters({ reload }));

    act(() => {
      result.current.changeEventTypes(["login_succeeded"]);
    });
    act(() => {
      result.current.changeActors(["7"]);
    });
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.eventTypes).toEqual([...AUDIT_EVENT_TYPES]);
    expect(result.current.actorIds).toEqual([]);
    expect(result.current.activeFilterCount).toBe(0);
  });
});
