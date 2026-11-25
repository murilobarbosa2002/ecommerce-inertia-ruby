import { useState } from "react";

import { AUDIT_EVENT_TYPES } from "@/lib/audit-events/auditEventTypes";

type ReloadFn = (overrides: {
  page: number;
  extra?: Record<string, string | number | boolean>;
}) => void;

interface UseAuditEventFiltersOptions {
  reload: ReloadFn;
}

// Combina data + hora escolhidas num timestamp que o backend entende
// (Time.zone.parse) — hora em branco cai num padrão sensato (início do
// dia pro início do intervalo, fim do dia pro fim), mesma função já usada
// no ActivityFeed do dashboard.
function toTimestamp(date: string, time: string, fallbackTime: string): string {
  if (!date) return "";
  return `${date}T${time || fallbackTime}`;
}

// Estado não-trivial (6 campos inter-relacionados + orquestração do
// reload) — hook próprio ao lado do componente que o usa (ADR 0029),
// mesmo racional de usePasswordGenerator.
export default function useAuditEventFilters({
  reload,
}: UseAuditEventFiltersOptions) {
  const [eventTypes, setEventTypes] = useState<string[]>([
    ...AUDIT_EVENT_TYPES,
  ]);
  // [] = nenhum usuário selecionado = sem filtro (mostra todos) — ao
  // contrário de eventTypes, aqui a ausência de seleção já é o estado
  // "sem filtro", sem precisar de um sentinel tipo ALL_ACTORS_VALUE.
  const [actorIds, setActorIds] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const activeFilterCount =
    (eventTypes.length < AUDIT_EVENT_TYPES.length ? 1 : 0) +
    (actorIds.length > 0 ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0);

  function buildExtra(overrides: {
    eventTypes?: string[];
    actorIds?: string[];
    from?: string;
    to?: string;
    fromTime?: string;
    toTime?: string;
  }) {
    const nextEventTypes = overrides.eventTypes ?? eventTypes;
    const nextActorIds = overrides.actorIds ?? actorIds;
    const nextFrom = overrides.from ?? from;
    const nextTo = overrides.to ?? to;
    const nextFromTime = overrides.fromTime ?? fromTime;
    const nextToTime = overrides.toTime ?? toTime;

    return {
      audit_events_event_types: nextEventTypes.join(","),
      audit_events_actor_ids: nextActorIds.join(","),
      audit_events_from: toTimestamp(nextFrom, nextFromTime, "00:00"),
      audit_events_to: toTimestamp(nextTo, nextToTime, "23:59"),
    };
  }

  const changeEventTypes = (next: string[]) => {
    setEventTypes(next);
    reload({ page: 1, extra: buildExtra({ eventTypes: next }) });
  };

  const changeActors = (next: string[]) => {
    setActorIds(next);
    reload({ page: 1, extra: buildExtra({ actorIds: next }) });
  };

  const changePeriod = (next: {
    from: string;
    to: string;
    fromTime: string;
    toTime: string;
  }) => {
    setFrom(next.from);
    setTo(next.to);
    setFromTime(next.fromTime);
    setToTime(next.toTime);
    reload({ page: 1, extra: buildExtra(next) });
  };

  const clearFilters = () => {
    setEventTypes([...AUDIT_EVENT_TYPES]);
    setActorIds([]);
    setFrom("");
    setTo("");
    setFromTime("");
    setToTime("");
    reload({
      page: 1,
      extra: buildExtra({
        eventTypes: [...AUDIT_EVENT_TYPES],
        actorIds: [],
        from: "",
        to: "",
        fromTime: "",
        toTime: "",
      }),
    });
  };

  return {
    eventTypes,
    actorIds,
    from,
    to,
    fromTime,
    toTime,
    activeFilterCount,
    changeEventTypes,
    changeActors,
    changePeriod,
    clearFilters,
  };
}
