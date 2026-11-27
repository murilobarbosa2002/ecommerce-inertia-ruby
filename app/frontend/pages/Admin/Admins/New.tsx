import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";
import Link from "@/components/shared/link/Link";
import { admin_admins_path } from "@/routes";

import AdminsNewForm from "./components/AdminsNewForm";
import { type AdminsNewProps } from "./New.types";

export default function AdminsNew({ roles }: AdminsNewProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.admins.new.title")}>
      <Head title={t("admin.admins.new.title")} />

      <PageHeader title={t("admin.admins.new.title")} />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <AdminsNewForm roles={roles} />
        </Card>
      </Reveal>

      <p className="mt-6 text-sm">
        <Link href={admin_admins_path()}>
          {t("admin.admins.new.backToList")}
        </Link>
      </p>
    </PanelLayout>
  );
}
