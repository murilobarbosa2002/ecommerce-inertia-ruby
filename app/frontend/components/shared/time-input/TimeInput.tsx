import { Clock } from "lucide-react";

import Popover from "@/components/shared/popover/Popover";

import { type TimeInputProps } from "./TimeInput.types";

const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
// Passo de 5 minutos: granularidade suficiente pra filtrar um evento de
// segurança por horário aproximado, mantendo a lista curta o bastante
// pra caber numa coluna sem precisar buscar.
const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

function parseValue(value: string): { hour: string; minute: string } {
  if (!value) return { hour: "", minute: "" };

  const [hour, minute] = value.split(":");
  return { hour, minute };
}

export default function TimeInput({
  id,
  value,
  onChange,
  placeholder = "--:--",
}: TimeInputProps) {
  const { hour, minute } = parseValue(value);

  const commit = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`);
  };

  return (
    <Popover
      align="start"
      trigger={
        <button
          id={id}
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <span className={value ? "text-fg" : "text-fg-subtle"}>
            {value || placeholder}
          </span>
          <Clock className="size-4 text-fg-subtle" aria-hidden="true" />
        </button>
      }
    >
      <div className="flex max-h-48 gap-2">
        <div className="themed-scrollbar flex-1 overflow-y-auto pr-1.5 pb-1.5">
          {HOURS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                commit(option, minute || "00");
              }}
              className={`block w-full rounded-control px-3 py-1.5 text-center text-sm ${
                option === hour
                  ? "bg-accent text-accent-fg"
                  : "text-fg hover:bg-surface-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="themed-scrollbar flex-1 overflow-y-auto pr-1.5 pb-1.5">
          {MINUTES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                commit(hour || "00", option);
              }}
              className={`block w-full rounded-control px-3 py-1.5 text-center text-sm ${
                option === minute
                  ? "bg-accent text-accent-fg"
                  : "text-fg hover:bg-surface-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Popover>
  );
}
