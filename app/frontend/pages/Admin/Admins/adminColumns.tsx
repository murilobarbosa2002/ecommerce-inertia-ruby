import { type TFunction } from "i18next";

import Avatar from "@/components/shared/avatar/Avatar";
import Badge from "@/components/shared/badge/Badge";
import { type DataTableColumn } from "@/components/shared/data-table/DataTable.types";
import formatPhone from "@/lib/formatPhone";

import { type AdminRow } from "./Index.types";

export default function getAdminColumns(
  t: TFunction,
): DataTableColumn<AdminRow>[] {
  return [
    {
      key: "name",
      header: t("admin.admins.index.nameColumn"),
      sortable: true,
      render: (admin) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${admin.first_name} ${admin.last_name}`} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">
              {admin.first_name} {admin.last_name}
            </p>
            <p className="truncate text-xs text-fg-subtle">
              {admin.email_address}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role_name",
      header: t("admin.admins.index.roleColumn"),
      sortable: true,
      render: (admin) => <Badge tone="brand">{admin.role_name}</Badge>,
    },
    {
      key: "phone",
      header: t("admin.admins.index.phoneColumn"),
      render: (admin) => (
        <span className={admin.phone ? "text-fg" : "text-fg-subtle"}>
          {formatPhone(admin.phone)}
        </span>
      ),
    },
  ];
}
