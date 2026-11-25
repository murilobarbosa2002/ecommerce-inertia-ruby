import { useState } from "react";
import { router } from "@inertiajs/react";

import {
  type DataTableSort,
  type DataTableSortDirection,
} from "./DataTable.types";

export interface UseDataTableOptions {
  // Prop(s) compartilhada(s) que essa tabela recarrega via Inertia
  // (router.reload só busca essas, sem recarregar a página inteira) —
  // mesmo padrão já usado no feed de atividade do dashboard.
  only: string[];
  // Prefixo dos parâmetros de query string (ex. "admins" -> admins_page,
  // admins_search, admins_sort, admins_direction) — evita colisão se um
  // dia duas tabelas existirem na mesma página.
  paramPrefix: string;
  defaultSort?: DataTableSort;
}

export default function useDataTable({
  only,
  paramPrefix,
  defaultSort,
}: UseDataTableOptions) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DataTableSort | null>(defaultSort ?? null);
  const [isLoading, setIsLoading] = useState(false);

  // page nunca é estado local — a página atual sempre vem do prop que o
  // backend devolveu (ex. admins.page), igual ao ActivityFeed já faz; o
  // hook só manda o próximo valor pedido por quem chama changePage.
  const reload = (overrides: {
    page: number;
    search?: string;
    sort?: DataTableSort | null;
  }) => {
    const nextSearch = overrides.search ?? search;
    const nextSort = overrides.sort !== undefined ? overrides.sort : sort;

    setIsLoading(true);
    router.reload({
      only,
      data: {
        [`${paramPrefix}_page`]: overrides.page,
        [`${paramPrefix}_search`]: nextSearch,
        [`${paramPrefix}_sort`]: nextSort?.column ?? "",
        [`${paramPrefix}_direction`]: nextSort?.direction ?? "",
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    reload({ page: 1, search: value });
  };

  const changeSort = (column: string) => {
    const nextDirection: DataTableSortDirection =
      sort?.column === column && sort.direction === "asc" ? "desc" : "asc";
    const nextSort: DataTableSort = { column, direction: nextDirection };

    setSort(nextSort);
    reload({ page: 1, sort: nextSort });
  };

  const changePage = (page: number) => {
    reload({ page });
  };

  return { search, sort, isLoading, changeSearch, changeSort, changePage };
}
