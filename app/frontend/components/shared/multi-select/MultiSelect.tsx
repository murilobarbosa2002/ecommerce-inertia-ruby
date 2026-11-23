import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import Checkbox from "@/components/shared/checkbox/Checkbox";
import Label from "@/components/shared/label/Label";
import Popover from "@/components/shared/popover/Popover";

import { type MultiSelectProps } from "./MultiSelect.types";

export default function MultiSelect({
  id,
  label,
  options,
  selected,
  onChange,
  searchPlaceholder,
  summary,
}: MultiSelectProps) {
  const [search, setSearch] = useState("");

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  );
  const visibleOptions = options.filter((option) =>
    option.label
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const summaryText = summary(selectedOptions);

  const toggle = (value: string, checked: boolean) => {
    onChange(
      checked ? [...selected, value] : selected.filter((v) => v !== value),
    );
  };

  // Texto visual, não um <label for> de verdade — ver MultiSelectProps.
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-fg-muted select-none">
        {label}
      </p>
      <Popover
        align="start"
        trigger={
          <button
            id={id}
            type="button"
            aria-label={`${label}: ${summaryText}`}
            className="flex w-full items-center justify-between gap-2 rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <span className="truncate" aria-hidden="true">
              {summaryText}
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-fg-subtle"
              aria-hidden="true"
            />
          </button>
        }
      >
        <div className="relative mb-2">
          <Search
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className="w-full rounded-control border border-line-strong bg-surface py-1.5 pr-2 pl-8 text-sm text-fg outline-none placeholder:text-fg-subtle focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <fieldset>
          <legend className="sr-only">{label}</legend>
          <ul className="mr-1 mb-1 themed-scrollbar max-h-48 space-y-0.5 overflow-y-auto">
            {visibleOptions.map((option) => (
              <li key={option.value}>
                <Label
                  htmlFor={`${id ?? "multi-select"}-${option.value}`}
                  className="mb-0 flex cursor-pointer items-center gap-2 rounded-control px-2 py-1.5 font-normal hover:bg-surface-muted"
                >
                  <Checkbox
                    id={`${id ?? "multi-select"}-${option.value}`}
                    checked={selected.includes(option.value)}
                    onCheckedChange={(checked) => {
                      toggle(option.value, checked === true);
                    }}
                  />
                  {option.label}
                </Label>
              </li>
            ))}
          </ul>
        </fieldset>
      </Popover>
    </div>
  );
}
