import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { edit_admin_role_path, new_admin_role_path } from "@/routes";

interface RoleRow {
  id: number;
  name: string;
  permission_ids: number[];
  permission_keys: string[];
}

export default function RolesIndex({ roles }: { roles: RoleRow[] }) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.roles.index.title")}>
      <Head title={t("admin.roles.index.title")} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("admin.roles.index.title")}
        </h1>
        <Link href={new_admin_role_path()}>
          {t("admin.roles.index.newButtonLabel")}
        </Link>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-left text-sm dark:border-gray-800">
        <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              {t("admin.roles.index.nameColumn")}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t("admin.roles.index.permissionsColumn")}
            </th>
            <th scope="col" className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                {role.name}
              </td>
              <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                {role.permission_keys.join(", ")}
              </td>
              <td className="px-4 py-2 text-right">
                <Link href={edit_admin_role_path(role.id)}>
                  {t("admin.roles.index.editLink")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelLayout>
  );
}
