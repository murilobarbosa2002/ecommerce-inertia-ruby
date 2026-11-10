import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";

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

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.storeSettings.edit.title")}
      </h1>

      <StoreSettingsEditForm name={name} logo_url={logo_url} />
    </PanelLayout>
  );
}
