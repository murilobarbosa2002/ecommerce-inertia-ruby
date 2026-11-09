import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { admin_admins_path } from "@/routes";

import AdminsNewForm from "./components/AdminsNewForm";
import { type AdminsNewProps } from "./New.types";

export default function AdminsNew({ roles }: AdminsNewProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.admins.new.title")}>
      <Head title={t("admin.admins.new.title")} />

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.admins.new.title")}
      </h1>

      <AdminsNewForm roles={roles} />

      <p className="mt-6 text-sm">
        <Link href={admin_admins_path()}>
          {t("admin.admins.new.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
