import { type ReactNode } from "react";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  sortable?: boolean;
  // Alinhamento da célula (cabeçalho e dado) — "end" pra número/ação.
  align?: "start" | "end";
  render: (row: Row) => ReactNode;
}

export type DataTableSortDirection = "asc" | "desc";

export interface DataTableSort {
  column: string;
  direction: DataTableSortDirection;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string | number;
  sort?: DataTableSort | null;
  onSortChange?: (column: string) => void;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle: string;
  emptyDescription?: string;
  // Ações por linha (ex. editar, resetar 2FA) — vira uma coluna extra sem
  // header na tabela (desktop) e a lista de ações dentro do Drawer
  // (mobile), sem o chamador duplicar a lógica pros dois. context diz onde
  // está sendo renderizado: "table" cabe só um botão de ícone (menu), já
  // que a linha é estreita; "drawer" tem a largura toda do painel — ações
  // escondidas atrás de um menu ali seriam pouco descobríveis, então o
  // chamador normalmente mostra botões com rótulo visível nesse caso.
  rowActions?: (row: Row, context: "table" | "drawer") => ReactNode;
}
