import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { admin_roles_path } from "@/routes";

import RolesNewForm from "./components/RolesNewForm";
import { type RolesNewProps } from "./New.types";

export default function RolesNew({ permissions }: RolesNewProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.roles.new.title")}>
      <Head title={t("admin.roles.new.title")} />

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.roles.new.title")}
      </h1>

      <RolesNewForm permissions={permissions} />

      <p className="mt-6 text-sm">
        <Link href={admin_roles_path()}>{t("admin.roles.new.backToList")}</Link>
      </p>
    </PanelLayout>
  );
}
