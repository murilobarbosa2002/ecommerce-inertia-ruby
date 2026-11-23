import { useState } from "react";
import { router } from "@inertiajs/react";
import { type ParseKeys, type TFunction } from "i18next";
import { motion } from "motion/react";
import {
  Filter,
  Lock,
  LogIn,
  type LucideIcon,
  ShieldAlert,
  ShieldCheck,
  Store,
  Unlock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import Badge from "@/components/shared/badge/Badge";
import Button from "@/components/shared/button/Button";
import DateRangePicker from "@/components/shared/date-range-picker/DateRangePicker";
import EmptyState from "@/components/shared/empty-state/EmptyState";
import MultiSelect from "@/components/shared/multi-select/MultiSelect";
import Popover from "@/components/shared/popover/Popover";

import {
  type ActivityEvent,
  type ActivityFeedProps,
} from "./ActivityFeed.types";

const EVENT_ICONS: Record<string, LucideIcon> = {
  login_succeeded: LogIn,
  login_failed: ShieldAlert,
  account_locked: Lock,
  account_unlocked: Unlock,
  two_factor_reset_by_admin: ShieldCheck,
  store_settings_updated: Store,
};

const EVENT_TONE: Record<string, string> = {
  login_succeeded: "bg-success-soft text-success-text",
  login_failed: "bg-danger-soft text-danger-text",
  account_locked: "bg-danger-soft text-danger-text",
  account_unlocked: "bg-success-soft text-success-text",
  two_factor_reset_by_admin: "bg-warning-soft text-warning-text",
  store_settings_updated: "bg-info-soft text-info-text",
};

// Mesma lista de AuditEvents::RecentActivity::RELEVANT_EVENT_TYPES — o
// backend é quem de fato restringe o que é aceito; esta só desenha o
// combobox de filtro.
const FILTERABLE_EVENT_TYPES = Object.keys(EVENT_ICONS);

// i18next só aceita string | number pra interpolação — os campos de
// e-mail do backend vêm string | null (admin/performed_by_admin podem não
// existir, ex. login_failed sem conta correspondente), e metadata é
// Record<string, unknown>, então o fallback precisa de um cast explícito.
function emailOrFallback(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function eventDescription(event: ActivityEvent, t: TFunction): string {
  switch (event.event_type) {
    case "login_succeeded":
      return t("admin.dashboard.show.activity.loginSucceeded", {
        email: emailOrFallback(event.admin_email),
      });
    case "login_failed":
      return t("admin.dashboard.show.activity.loginFailed", {
        email: emailOrFallback(
          event.admin_email ?? event.metadata.email_address,
        ),
      });
    case "account_locked":
      return t("admin.dashboard.show.activity.accountLocked", {
        email: emailOrFallback(event.admin_email),
      });
    case "account_unlocked":
      return t("admin.dashboard.show.activity.accountUnlocked", {
        email: emailOrFallback(event.admin_email),
      });
    case "two_factor_reset_by_admin":
      return t("admin.dashboard.show.activity.twoFactorResetByAdmin", {
        email: emailOrFallback(event.admin_email),
        actorEmail: emailOrFallback(event.performed_by_admin_email),
      });
    case "store_settings_updated":
      return t("admin.dashboard.show.activity.storeSettingsUpdated", {
        actorEmail: emailOrFallback(event.performed_by_admin_email),
      });
    default:
      return event.event_type;
  }
}

// Combina data + hora escolhidas num timestamp que o backend entende
// (Time.zone.parse) — hora em branco cai num padrão sensato (início do
// dia pro início do intervalo, fim do dia pro fim), não trava o filtro
// numa janela de minutos só porque a pessoa só escolheu o dia.
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
    label: t(
      `admin.dashboard.show.activity.filters.types.${eventType}` as ParseKeys,
    ),
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
          trigger={
            <Button type="button" intent="outline" size="sm">
              <Filter className="size-4" aria-hidden="true" />
              {t("admin.dashboard.show.activity.filters.trigger")}
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
                label={t(
                  "admin.dashboard.show.activity.filters.eventTypesLabel",
                )}
                options={eventTypeOptions}
                selected={eventTypes}
                onChange={changeEventTypes}
                searchPlaceholder={t(
                  "admin.dashboard.show.activity.filters.searchPlaceholder",
                )}
                summary={(selectedOptions) => {
                  if (selectedOptions.length === eventTypeOptions.length) {
                    return t("admin.dashboard.show.activity.filters.allTypes");
                  }
                  if (selectedOptions.length === 0) {
                    return t(
                      "admin.dashboard.show.activity.filters.noneSelected",
                    );
                  }
                  return t(
                    "admin.dashboard.show.activity.filters.selectedCount",
                    { count: selectedOptions.length },
                  );
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
              {t("admin.dashboard.show.activity.filters.clear")}
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
        <motion.ol
          key={activity.events.map((event) => event.id).join(",")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          {activity.events.map((event) => {
            const Icon = EVENT_ICONS[event.event_type] ?? ShieldAlert;
            const tone =
              EVENT_TONE[event.event_type] ?? "bg-surface-muted text-fg-muted";

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
                      {eventDescription(event, t)}
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
        </motion.ol>
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
