import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { edit_admin_admin_path, new_admin_admin_path } from "@/routes";

import { type AdminsIndexProps } from "./Index.types";

export default function AdminsIndex({ admins }: AdminsIndexProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.admins.index.title")}>
      <Head title={t("admin.admins.index.title")} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("admin.admins.index.title")}
        </h1>
        <Link href={new_admin_admin_path()}>
          {t("admin.admins.index.newButtonLabel")}
        </Link>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-left text-sm dark:border-gray-800">
        <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              {t("admin.admins.index.emailColumn")}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t("admin.admins.index.roleColumn")}
            </th>
            <th scope="col" className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                {admin.email_address}
              </td>
              <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                {admin.role_name}
              </td>
              <td className="px-4 py-2 text-right">
                <Link href={edit_admin_admin_path(admin.id)}>
                  {t("admin.admins.index.editLink")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelLayout>
  );
}
