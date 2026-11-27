import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import PageHeader from "@/components/admin/page-header/PageHeader";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";

import StoreSettingsEditForm from "./components/StoreSettingsEditForm";
import { type StoreSettingsEditProps } from "./Edit.types";

export default function StoreSettingsEdit({
  name,
  logo_url,
}: StoreSettingsEditProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.storeSettings.edit.title")}>
      <Head title={t("admin.storeSettings.edit.title")} />

      <PageHeader
        title={t("admin.storeSettings.edit.title")}
        description={t("admin.storeSettings.edit.description")}
      />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <StoreSettingsEditForm name={name} logo_url={logo_url} />
        </Card>
      </Reveal>
    </PanelLayout>
  );
}
