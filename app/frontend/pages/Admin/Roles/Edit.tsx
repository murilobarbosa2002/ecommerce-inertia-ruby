import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";
import Link from "@/components/shared/link/Link";
import { admin_roles_path } from "@/routes";

import RolesEditForm from "./components/RolesEditForm";
import { type RolesEditProps } from "./Edit.types";

export default function RolesEdit({ role, permissions }: RolesEditProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.roles.edit.title")}>
      <Head title={t("admin.roles.edit.title")} />

      <PageHeader title={t("admin.roles.edit.title")} />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <RolesEditForm role={role} permissions={permissions} />
        </Card>
      </Reveal>

      <p className="mt-6 text-sm">
        <Link href={admin_roles_path()}>
          {t("admin.roles.edit.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
