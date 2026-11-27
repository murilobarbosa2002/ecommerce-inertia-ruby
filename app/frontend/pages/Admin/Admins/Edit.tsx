import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";
import Link from "@/components/shared/link/Link";
import { admin_admins_path } from "@/routes";

import AdminsEditForm from "./components/AdminsEditForm";
import ResetTwoFactorButton from "./components/ResetTwoFactorButton";
import { type AdminsEditProps } from "./Edit.types";

export default function AdminsEdit({ admin, roles }: AdminsEditProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.admins.edit.title")}>
      <Head title={t("admin.admins.edit.title")} />

      <PageHeader title={t("admin.admins.edit.title")} />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <AdminsEditForm admin={admin} roles={roles} />

          <ResetTwoFactorButton adminId={admin.id} />
        </Card>
      </Reveal>

      <p className="mt-6 text-sm">
        <Link href={admin_admins_path()}>
          {t("admin.admins.edit.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
