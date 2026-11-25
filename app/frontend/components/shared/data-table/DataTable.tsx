import { ChevronRight } from "lucide-react";

import Drawer from "@/components/shared/drawer/Drawer";
import EmptyState from "@/components/shared/empty-state/EmptyState";
import Skeleton from "@/components/shared/skeleton/Skeleton";

import DataTableHeaderCell from "./data-table-header-cell/DataTableHeaderCell";
import { type DataTableProps } from "./DataTable.types";
import { dataTable } from "./DataTable.variants";
import useRowDrawer from "./useRowDrawer";

// Genérica de propósito: qualquer tela de listagem (Admins, Papéis, e
// depois a auditoria) declara só as colunas — o corpo (tabela no desktop,
// cards + Drawer de detalhe no mobile, skeleton de carregamento, estado
// vazio, ordenação) é sempre o mesmo daqui em diante.
//
// Mobile não tenta encaixar a tabela inteira numa tela estreita: cada
// linha vira um cartão resumido (primeira e segunda coluna declaradas),
// que abre um Drawer com todas as colunas (rótulo + valor) e as ações da
// linha — em vez de rolagem horizontal ou colunas cortadas.
export default function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  sort = null,
  onSortChange,
  isLoading = false,
  skeletonRows = 5,
  emptyTitle,
  emptyDescription,
  rowActions,
}: DataTableProps<Row>) {
  const slots = dataTable();
  const { openRow, openDrawer, closeDrawer } = useRowDrawer(rows, getRowKey);

  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        titleAs="h3"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const primaryColumn = columns[0];
  // DataTable com uma coluna só é um caso real (sem segunda a mostrar no
  // cartão mobile) — o length check deixa isso tipado como possivelmente
  // undefined sem depender de noUncheckedIndexedAccess.
  const secondaryColumn = columns.length > 1 ? columns[1] : undefined;
  const skeletonKeys = Array.from({ length: skeletonRows }, (_, index) =>
    String(index),
  );

  return (
    <>
      <div className={`hidden lg:block ${slots.root()}`}>
        <table className={slots.table()}>
          <thead className={slots.thead()}>
            <tr>
              {columns.map((column) => (
                <DataTableHeaderCell
                  key={column.key}
                  label={column.header}
                  align={column.align}
                  sortable={Boolean(column.sortable)}
                  active={sort?.column === column.key}
                  direction={
                    sort?.column === column.key ? sort.direction : undefined
                  }
                  onSortToggle={() => onSortChange?.(column.key)}
                />
              ))}
              {rowActions && <th scope="col" className={slots.td()} />}
            </tr>
          </thead>
          <tbody className={slots.tbody()}>
            {isLoading
              ? skeletonKeys.map((key) => (
                  <tr key={`skeleton-${key}`}>
                    {columns.map((column) => (
                      <td key={column.key} className={slots.td()}>
                        <Skeleton className="h-4 w-full max-w-40" />
                      </td>
                    ))}
                    {rowActions && <td className={slots.td()} />}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={getRowKey(row)}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`${slots.td()} ${column.align === "end" ? "text-right" : ""}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className={`${slots.td()} text-right`}>
                        {rowActions(row, "table")}
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card lg:hidden">
        {isLoading
          ? skeletonKeys.map((key) => (
              <li key={`skeleton-${key}`} className="p-4">
                <Skeleton className="mb-2 h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </li>
            ))
          : rows.map((row) => (
              <li key={getRowKey(row)}>
                <button
                  type="button"
                  onClick={() => {
                    openDrawer(row);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-muted"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-fg">
                      {primaryColumn.render(row)}
                    </div>
                    {secondaryColumn && (
                      <div className="truncate text-xs text-fg-subtle">
                        {secondaryColumn.render(row)}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-fg-subtle"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
      </ul>

      <Drawer
        open={openRow !== null}
        onOpenChange={(next) => {
          if (!next) closeDrawer();
        }}
        title={openRow ? primaryColumn.render(openRow) : ""}
      >
        {openRow && (
          <>
            <dl className="divide-y divide-line">
              {columns
                .filter((column) => column.key !== primaryColumn.key)
                .map((column) => (
                  <div key={column.key} className="py-3 first:pt-0">
                    <dt className="mb-1.5 text-xs font-medium tracking-wide text-fg-subtle uppercase">
                      {column.header}
                    </dt>
                    <dd className="text-sm text-fg">
                      {column.render(openRow)}
                    </dd>
                  </div>
                ))}
            </dl>
            {rowActions && (
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
                {rowActions(openRow, "drawer")}
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
