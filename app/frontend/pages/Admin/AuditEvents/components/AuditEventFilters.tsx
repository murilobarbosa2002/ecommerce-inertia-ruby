import { type ParseKeys } from "i18next";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

import Badge from "@/components/shared/badge/Badge";
import Button from "@/components/shared/button/Button";
import DateRangePicker from "@/components/shared/date-range-picker/DateRangePicker";
import MultiSelect from "@/components/shared/multi-select/MultiSelect";
import Popover from "@/components/shared/popover/Popover";
import { AUDIT_EVENT_TYPES } from "@/lib/audit-events/auditEventTypes";

import { type AuditActor } from "../Index.types";
import useAuditEventFilters from "./useAuditEventFilters";

export interface AuditEventFiltersProps {
  actors: AuditActor[];
  reload: (overrides: {
    page: number;
    extra?: Record<string, string | number | boolean>;
  }) => void;
}

export default function AuditEventFilters({
  actors,
  reload,
}: AuditEventFiltersProps) {
  const { t } = useTranslation();
  const {
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
  } = useAuditEventFilters({ reload });

  const eventTypeOptions = AUDIT_EVENT_TYPES.map((eventType) => ({
    value: eventType,
    label: t(`admin.auditEvents.types.${eventType}` as ParseKeys),
  }));

  const actorOptions = actors.map((actor) => ({
    value: String(actor.id),
    label: actor.email_address,
  }));

  return (
    <Popover
      drawerOnMobile
      title={t("admin.auditEvents.filters.trigger")}
      trigger={
        <Button type="button" intent="outline" size="sm">
          <Filter className="size-4" aria-hidden="true" />
          {t("admin.auditEvents.filters.trigger")}
          {activeFilterCount > 0 && (
            <Badge tone="brand" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      }
    >
      <div className="space-y-4">
        <MultiSelect
          id="audit-events-type-search"
          label={t("admin.auditEvents.filters.eventTypesLabel")}
          options={eventTypeOptions}
          selected={eventTypes}
          onChange={changeEventTypes}
          searchPlaceholder={t("admin.auditEvents.filters.searchPlaceholder")}
          summary={(selectedOptions) => {
            if (selectedOptions.length === eventTypeOptions.length) {
              return t("admin.auditEvents.filters.allTypes");
            }
            if (selectedOptions.length === 0) {
              return t("admin.auditEvents.filters.noneSelected");
            }
            return t("admin.auditEvents.filters.selectedCount", {
              count: selectedOptions.length,
            });
          }}
        />

        <MultiSelect
          id="audit-events-actor-search"
          label={t("admin.auditEvents.filters.actorLabel")}
          options={actorOptions}
          selected={actorIds}
          onChange={changeActors}
          searchPlaceholder={t(
            "admin.auditEvents.filters.actorSearchPlaceholder",
          )}
          summary={(selectedOptions) => {
            if (selectedOptions.length === 0) {
              return t("admin.auditEvents.filters.allActors");
            }
            return t("admin.auditEvents.filters.selectedCount", {
              count: selectedOptions.length,
            });
          }}
        />

        <DateRangePicker
          from={from}
          to={to}
          fromTime={fromTime}
          toTime={toTime}
          onChange={changePeriod}
        />

        <Button
          type="button"
          intent="ghost"
          size="sm"
          fullWidth
          onClick={clearFilters}
        >
          {t("admin.auditEvents.filters.clear")}
        </Button>
      </div>
    </Popover>
  );
}
