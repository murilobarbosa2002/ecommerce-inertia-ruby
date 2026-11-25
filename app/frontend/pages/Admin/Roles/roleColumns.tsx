import { type TFunction } from "i18next";

import Badge from "@/components/shared/badge/Badge";
import { type DataTableColumn } from "@/components/shared/data-table/DataTable.types";

import { type RoleRow } from "./Index.types";

const VISIBLE_PERMISSIONS = 3;

export default function getRoleColumns(
  t: TFunction,
): DataTableColumn<RoleRow>[] {
  return [
    {
      key: "name",
      header: t("admin.roles.index.nameColumn"),
      sortable: true,
      render: (role) => (
        <span className="font-medium text-fg">{role.name}</span>
      ),
    },
    {
      key: "permissions",
      header: t("admin.roles.index.permissionsColumn"),
      render: (role) => {
        const shown = role.permission_keys.slice(0, VISIBLE_PERMISSIONS);
        const hiddenCount = role.permission_keys.length - shown.length;

        if (shown.length === 0) {
          return <span className="text-fg-subtle">—</span>;
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {shown.map((key) => (
              <Badge key={key} tone="neutral">
                {key}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge tone="neutral">
                {t("admin.roles.index.morePermissions", {
                  count: hiddenCount,
                })}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];
}
