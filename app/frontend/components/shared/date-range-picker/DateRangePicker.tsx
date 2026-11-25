import { format, parseISO } from "date-fns";
import { ptBR } from "react-day-picker/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTranslation } from "react-i18next";

import Label from "@/components/shared/label/Label";
import TimeInput from "@/components/shared/time-input/TimeInput";

import { type DateRangePickerProps } from "./DateRangePicker.types";

function toDate(value: string): Date | undefined {
  return value ? parseISO(value) : undefined;
}

export default function DateRangePicker({
  from,
  to,
  fromTime,
  toTime,
  onChange,
}: DateRangePickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <DayPicker
        mode="range"
        locale={ptBR}
        selected={{ from: toDate(from), to: toDate(to) }}
        onSelect={(range) => {
          onChange({
            from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
            fromTime,
            toTime,
          });
        }}
        classNames={{
          months: "flex",
          // relative: sem isso os botões de navegação (absolute) não têm
          // ancestral posicionado por perto e flutuam soltos na viewport.
          month: "relative space-y-2",
          month_caption: "flex h-9 items-center justify-center px-8",
          caption_label: "text-sm font-medium text-fg",
          nav: "absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between px-1",
          button_previous:
            "inline-flex size-7 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg",
          button_next:
            "inline-flex size-7 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg",
          chevron: "size-4 fill-current",
          month_grid: "mt-2 w-full table-fixed border-collapse",
          weekday: "p-0 pb-1 text-center text-xs font-normal text-fg-subtle",
          day: "p-0 text-center text-sm",
          day_button:
            "size-9 rounded-control text-fg transition-colors hover:bg-surface-muted",
          range_start: "rounded-l-control bg-accent text-accent-fg",
          range_end: "rounded-r-control bg-accent text-accent-fg",
          range_middle: "bg-accent-soft text-accent-text",
          selected: "bg-accent text-accent-fg",
          today: "font-semibold text-accent-text",
          outside: "text-fg-subtle opacity-50",
          disabled: "opacity-30",
        }}
      />

      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div>
          <Label htmlFor="activity-from-time" className="text-xs">
            {t("admin.auditEvents.filters.fromTimeLabel")}
          </Label>
          <TimeInput
            id="activity-from-time"
            value={fromTime}
            onChange={(nextFromTime) => {
              onChange({ from, to, fromTime: nextFromTime, toTime });
            }}
          />
        </div>
        <div>
          <Label htmlFor="activity-to-time" className="text-xs">
            {t("admin.auditEvents.filters.toTimeLabel")}
          </Label>
          <TimeInput
            id="activity-to-time"
            value={toTime}
            onChange={(nextToTime) => {
              onChange({ from, to, fromTime, toTime: nextToTime });
            }}
          />
        </div>
      </div>
    </div>
  );
}
