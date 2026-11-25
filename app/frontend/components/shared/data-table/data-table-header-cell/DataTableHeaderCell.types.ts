import { type DataTableSortDirection } from "../DataTable.types";

export interface DataTableHeaderCellProps {
  label: string;
  sortable: boolean;
  active: boolean;
  direction?: DataTableSortDirection;
  align?: "start" | "end";
  onSortToggle: () => void;
}
