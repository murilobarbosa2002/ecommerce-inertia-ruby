import { Head, router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Button from "@/components/shared/button/Button";
import Link from "@/components/shared/link/Link";
import { admin_admins_path, reset_two_factor_admin_admin_path } from "@/routes";
import { type SharedProps } from "@/types";

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
  const {
    props: { current_admin_permissions, current_admin_id },
  } = usePage<SharedProps>();

  const canResetTwoFactor =
    current_admin_permissions.includes("reset_two_factor") &&
    admin.id !== current_admin_id;

  const resetTwoFactor = () => {
    if (window.confirm(t("admin.admins.edit.resetTwoFactorConfirm"))) {
      router.post(reset_two_factor_admin_admin_path(admin.id));
    }
  };

  return (
    <PanelLayout title={t("admin.admins.edit.title")}>
      <Head title={t("admin.admins.edit.title")} />

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.admins.edit.title")}
      </h1>

      <AdminsEditForm admin={admin} roles={roles} />

      {canResetTwoFactor && (
        <p className="mt-6">
          <Button type="button" intent="ghost" onClick={resetTwoFactor}>
            {t("admin.admins.edit.resetTwoFactorButton")}
          </Button>
        </p>
      )}

      <p className="mt-6 text-sm">
        <Link href={admin_admins_path()}>
          {t("admin.admins.edit.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
