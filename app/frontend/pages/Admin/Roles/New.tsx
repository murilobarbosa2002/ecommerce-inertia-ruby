import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";
import Link from "@/components/shared/link/Link";
import { admin_roles_path } from "@/routes";

import RolesNewForm from "./components/RolesNewForm";
import { type RolesNewProps } from "./New.types";

export default function RolesNew({ permissions }: RolesNewProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.roles.new.title")}>
      <Head title={t("admin.roles.new.title")} />

      <PageHeader title={t("admin.roles.new.title")} />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <RolesNewForm permissions={permissions} />
        </Card>
      </Reveal>

      <p className="mt-6 text-sm">
        <Link href={admin_roles_path()}>{t("admin.roles.new.backToList")}</Link>
      </p>
    </PanelLayout>
  );
}
