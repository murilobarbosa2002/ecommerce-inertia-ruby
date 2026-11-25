import { Search } from "lucide-react";

import Input from "@/components/shared/input/Input";

import { type DataTableSearchInputProps } from "./DataTableSearchInput.types";

// Parte da DataTable (ADR 0033, sem uso legítimo fora dela) — toda tela com
// DataTable busca do mesmo jeito, só o placeholder muda por tela.
export default function DataTableSearchInput({
  value,
  onChange,
  placeholder,
}: DataTableSearchInputProps) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
