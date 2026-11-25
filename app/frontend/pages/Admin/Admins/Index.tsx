import { Head, Link } from "@inertiajs/react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import { button } from "@/components/shared/button/Button.variants";
import DataTable from "@/components/shared/data-table/DataTable";
import DataTableSearchInput from "@/components/shared/data-table/data-table-search-input/DataTableSearchInput";
import useDataTable from "@/components/shared/data-table/useDataTable";
import { new_admin_admin_path } from "@/routes";

import getAdminColumns from "./adminColumns";
import AdminRowActionsButtons from "./components/AdminRowActionsButtons";
import AdminRowActionsMenu from "./components/AdminRowActionsMenu";
import { type AdminsIndexProps } from "./Index.types";

export default function AdminsIndex({ admins }: AdminsIndexProps) {
  const { t } = useTranslation();
  const { search, sort, isLoading, changeSearch, changeSort, changePage } =
    useDataTable({ only: ["admins"], paramPrefix: "admins" });

  const columns = getAdminColumns(t);

  return (
    <PanelLayout title={t("admin.admins.index.title")}>
      <Head title={t("admin.admins.index.title")} />

      <PageHeader
        title={t("admin.admins.index.title")}
        description={t("admin.admins.index.description", {
          count: admins.total_count,
        })}
        action={
          <Link
            href={new_admin_admin_path()}
            className={button({ intent: "primary", size: "sm" })}
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {t("admin.admins.index.newButtonLabel")}
          </Link>
        }
      />

      <DataTableSearchInput
        value={search}
        onChange={changeSearch}
        placeholder={t("admin.admins.index.searchPlaceholder")}
      />

      <DataTable
        columns={columns}
        rows={admins.records}
        getRowKey={(admin) => admin.id}
        sort={sort}
        onSortChange={changeSort}
        isLoading={isLoading}
        emptyTitle={t("admin.admins.index.emptyTitle")}
        emptyDescription={t("admin.admins.index.emptyDescription")}
        rowActions={(admin, context) =>
          context === "table" ? (
            <AdminRowActionsMenu admin={admin} />
          ) : (
            <AdminRowActionsButtons admin={admin} />
          )
        }
      />

      <Pagination
        page={admins.page}
        totalPages={admins.total_pages}
        disabled={isLoading}
        onPrevious={() => {
          changePage(admins.page - 1);
        }}
        onNext={() => {
          changePage(admins.page + 1);
        }}
      />
    </PanelLayout>
  );
}
