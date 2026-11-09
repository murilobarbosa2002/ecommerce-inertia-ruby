import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { admin_admins_path } from "@/routes";

import AdminsEditForm from "./components/AdminsEditForm";

interface AdminToEdit {
  id: number;
  email_address: string;
  role_id: number;
}

export default function AdminsEdit({
  admin,
  roles,
}: {
  admin: AdminToEdit;
  roles: { id: number; name: string }[];
}) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.admins.edit.title")}>
      <Head title={t("admin.admins.edit.title")} />

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.admins.edit.title")}
      </h1>

      <AdminsEditForm admin={admin} roles={roles} />

      <p className="mt-6 text-sm">
        <Link href={admin_admins_path()}>
          {t("admin.admins.edit.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
