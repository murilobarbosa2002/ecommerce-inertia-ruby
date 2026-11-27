import { useState } from "react";
import { router } from "@inertiajs/react";
import { type ParseKeys } from "i18next";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import Reveal from "@/components/motion/Reveal";
import Badge from "@/components/shared/badge/Badge";
import Button from "@/components/shared/button/Button";
import DateRangePicker from "@/components/shared/date-range-picker/DateRangePicker";
import EmptyState from "@/components/shared/empty-state/EmptyState";
import MultiSelect from "@/components/shared/multi-select/MultiSelect";
import Popover from "@/components/shared/popover/Popover";
import {
  getAuditEventIcon,
  getAuditEventTone,
} from "@/lib/audit-events/auditEventTypes";
import getAuditEventDescription from "@/lib/audit-events/getAuditEventDescription";

import { type ActivityFeedProps } from "./ActivityFeed.types";

const FILTERABLE_EVENT_TYPES = [
  "account_locked",
  "account_unlocked",
  "store_settings_updated",
];

function toTimestamp(date: string, time: string, fallbackTime: string): string {
  if (!date) return "";
  return `${date}T${time || fallbackTime}`;
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<string[]>(
    FILTERABLE_EVENT_TYPES,
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const activeFilterCount =
    (eventTypes.length < FILTERABLE_EVENT_TYPES.length ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0);

  const eventTypeOptions = FILTERABLE_EVENT_TYPES.map((eventType) => ({
    value: eventType,
    label: t(`admin.auditEvents.types.${eventType}` as ParseKeys),
  }));

  const reload = (overrides: {
    page?: number;
    eventTypes?: string[];
    from?: string;
    to?: string;
    fromTime?: string;
    toTime?: string;
  }) => {
    const nextEventTypes = overrides.eventTypes ?? eventTypes;
    const nextFrom = overrides.from ?? from;
    const nextTo = overrides.to ?? to;
    const nextFromTime = overrides.fromTime ?? fromTime;
    const nextToTime = overrides.toTime ?? toTime;

    setIsLoading(true);
    router.reload({
      only: ["activity"],
      data: {
        activity_page: overrides.page ?? 1,
        activity_event_types: nextEventTypes.join(","),
        activity_from: toTimestamp(nextFrom, nextFromTime, "00:00"),
        activity_to: toTimestamp(nextTo, nextToTime, "23:59"),
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  const changeEventTypes = (next: string[]) => {
    setEventTypes(next);
    reload({ page: 1, eventTypes: next });
  };

  const clearFilters = () => {
    setEventTypes(FILTERABLE_EVENT_TYPES);
    setFrom("");
    setTo("");
    setFromTime("");
    setToTime("");
    reload({
      page: 1,
      eventTypes: FILTERABLE_EVENT_TYPES,
      from: "",
      to: "",
      fromTime: "",
      toTime: "",
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">
          {t("admin.dashboard.show.activity.title")}
        </h2>

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
            <div>
              <MultiSelect
                id="activity-type-search"
                label={t("admin.auditEvents.filters.eventTypesLabel")}
                options={eventTypeOptions}
                selected={eventTypes}
                onChange={changeEventTypes}
                searchPlaceholder={t(
                  "admin.auditEvents.filters.searchPlaceholder",
                )}
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
            </div>

            <DateRangePicker
              from={from}
              to={to}
              fromTime={fromTime}
              toTime={toTime}
              onChange={(next) => {
                setFrom(next.from);
                setTo(next.to);
                setFromTime(next.fromTime);
                setToTime(next.toTime);
                reload({
                  page: 1,
                  from: next.from,
                  to: next.to,
                  fromTime: next.fromTime,
                  toTime: next.toTime,
                });
              }}
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
      </div>

      {activity.events.length === 0 ? (
        <EmptyState
          titleAs="h3"
          title={t("admin.dashboard.show.activity.emptyTitle")}
          description={t("admin.dashboard.show.activity.emptyDescription")}
        />
      ) : (
        <Reveal
          as="ol"
          key={activity.events.map((event) => event.id).join(",")}
          direction="up"
          duration={0.3}
          className="space-y-1"
        >
          {activity.events.map((event) => {
            const Icon = getAuditEventIcon(event.event_type);
            const tone = getAuditEventTone(event.event_type);

            return (
              <li key={event.id}>
                <div className="-mx-2 flex items-start gap-3 rounded-control px-2 py-2.5 transition-colors hover:bg-surface-muted">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${tone}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-fg">
                      {getAuditEventDescription(event, t)}
                    </p>
                    <time
                      dateTime={event.happened_at}
                      className="text-xs text-fg-subtle"
                    >
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(event.happened_at))}
                    </time>
                  </div>
                </div>
              </li>
            );
          })}
        </Reveal>
      )}

      <Pagination
        page={activity.page}
        totalPages={activity.total_pages}
        disabled={isLoading}
        onPrevious={() => {
          reload({ page: activity.page - 1 });
        }}
        onNext={() => {
          reload({ page: activity.page + 1 });
        }}
      />
    </div>
  );
}
