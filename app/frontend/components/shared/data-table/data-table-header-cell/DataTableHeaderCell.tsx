import { ChevronDown, ChevronUp } from "lucide-react";

import { type DataTableHeaderCellProps } from "./DataTableHeaderCell.types";
import { dataTableHeaderCell } from "./DataTableHeaderCell.variants";

// aria-sort só faz sentido numa coluna ordenável — "none" sinaliza "dá pra
// ordenar por aqui, mas não é o critério atual", distinto de omitir o
// atributo inteiro (coluna que nunca ordena nada).
export default function DataTableHeaderCell({
  label,
  sortable,
  active,
  direction,
  align = "start",
  onSortToggle,
}: DataTableHeaderCellProps) {
  const slots = dataTableHeaderCell({ align });
  const ariaSort = sortable
    ? active
      ? direction === "asc"
        ? "ascending"
        : "descending"
      : "none"
    : undefined;

  return (
    <th scope="col" aria-sort={ariaSort} className={slots.th()}>
      {sortable ? (
        <button type="button" onClick={onSortToggle} className={slots.button()}>
          {label}
          {active &&
            (direction === "asc" ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            ))}
        </button>
      ) : (
        label
      )}
    </th>
  );
}
