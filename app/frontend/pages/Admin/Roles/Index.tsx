import { Head, Link } from "@inertiajs/react";
import { ShieldPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import { button } from "@/components/shared/button/Button.variants";
import DataTable from "@/components/shared/data-table/DataTable";
import DataTableSearchInput from "@/components/shared/data-table/data-table-search-input/DataTableSearchInput";
import useDataTable from "@/components/shared/data-table/useDataTable";
import { new_admin_role_path } from "@/routes";

import { type RolesIndexProps } from "./Index.types";
import getRoleColumns from "./roleColumns";
import RoleRowActionsButton from "./components/RoleRowActionsButton";
import RoleRowActionsMenu from "./components/RoleRowActionsMenu";

export default function RolesIndex({ roles }: RolesIndexProps) {
  const { t } = useTranslation();
  const { search, sort, isLoading, changeSearch, changeSort, changePage } =
    useDataTable({ only: ["roles"], paramPrefix: "roles" });

  const columns = getRoleColumns(t);

  return (
    <PanelLayout title={t("admin.roles.index.title")}>
      <Head title={t("admin.roles.index.title")} />

      <PageHeader
        title={t("admin.roles.index.title")}
        description={t("admin.roles.index.description", {
          count: roles.total_count,
        })}
        action={
          <Link
            href={new_admin_role_path()}
            className={button({ intent: "primary", size: "sm" })}
          >
            <ShieldPlus className="size-4" aria-hidden="true" />
            {t("admin.roles.index.newButtonLabel")}
          </Link>
        }
      />

      <DataTableSearchInput
        value={search}
        onChange={changeSearch}
        placeholder={t("admin.roles.index.searchPlaceholder")}
      />

      <DataTable
        columns={columns}
        rows={roles.records}
        getRowKey={(role) => role.id}
        sort={sort}
        onSortChange={changeSort}
        isLoading={isLoading}
        emptyTitle={t("admin.roles.index.emptyTitle")}
        emptyDescription={t("admin.roles.index.emptyDescription")}
        rowActions={(role, context) =>
          context === "table" ? (
            <RoleRowActionsMenu role={role} />
          ) : (
            <RoleRowActionsButton role={role} />
          )
        }
      />

      <Pagination
        page={roles.page}
        totalPages={roles.total_pages}
        disabled={isLoading}
        onPrevious={() => {
          changePage(roles.page - 1);
        }}
        onNext={() => {
          changePage(roles.page + 1);
        }}
      />
    </PanelLayout>
  );
}
