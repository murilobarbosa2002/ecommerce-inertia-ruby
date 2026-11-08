import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";

export default function DashboardShow() {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.dashboard.show.title")}>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.dashboard.show.title")}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t("admin.dashboard.show.placeholder")}
      </p>
    </PanelLayout>
  );
}
