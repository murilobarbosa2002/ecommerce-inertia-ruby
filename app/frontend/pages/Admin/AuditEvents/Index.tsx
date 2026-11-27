import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import DataTable from "@/components/shared/data-table/DataTable";
import DataTableSearchInput from "@/components/shared/data-table/data-table-search-input/DataTableSearchInput";
import useDataTable from "@/components/shared/data-table/useDataTable";

import getAuditEventColumns from "./auditEventColumns";
import AuditEventFilters from "./components/AuditEventFilters";
import { type AuditEventsIndexProps } from "./Index.types";

export default function AuditEventsIndex({
  audit_events: auditEvents,
  actors,
}: AuditEventsIndexProps) {
  const { t } = useTranslation();
  const {
    search,
    sort,
    isLoading,
    changeSearch,
    changeSort,
    changePage,
    reload,
  } = useDataTable({
    only: ["audit_events"],
    paramPrefix: "audit_events",
    defaultSort: { column: "happened_at", direction: "desc" },
  });

  const columns = getAuditEventColumns(t);

  return (
    <PanelLayout title={t("admin.auditEvents.index.title")}>
      <Head title={t("admin.auditEvents.index.title")} />

      <PageHeader
        title={t("admin.auditEvents.index.title")}
        description={t("admin.auditEvents.index.description", {
          count: auditEvents.total_count,
        })}
      />

      <Reveal direction="up" duration={0.3}>
        <div className="mb-4 flex items-center gap-3">
          <DataTableSearchInput
            value={search}
            onChange={changeSearch}
            placeholder={t("admin.auditEvents.index.searchPlaceholder")}
            className="max-w-none flex-1"
          />
          <AuditEventFilters actors={actors} reload={reload} />
        </div>
      </Reveal>

      <DataTable
        columns={columns}
        rows={auditEvents.records}
        getRowKey={(event) => event.id}
        sort={sort}
        onSortChange={changeSort}
        isLoading={isLoading}
        emptyTitle={t("admin.auditEvents.index.emptyTitle")}
        emptyDescription={t("admin.auditEvents.index.emptyDescription")}
      />

      <Pagination
        page={auditEvents.page}
        totalPages={auditEvents.total_pages}
        disabled={isLoading}
        onPrevious={() => {
          changePage(auditEvents.page - 1);
        }}
        onNext={() => {
          changePage(auditEvents.page + 1);
        }}
      />
    </PanelLayout>
  );
}
