import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Card from "@/components/shared/card/Card";
import EmptyState from "@/components/shared/empty-state/EmptyState";

export default function DashboardShow() {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.dashboard.show.title")}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-fg">
        {t("admin.dashboard.show.title")}
      </h1>
      <Card>
        <EmptyState
          icon={Construction}
          titleAs="h2"
          title={t("admin.dashboard.show.placeholderTitle")}
          description={t("admin.dashboard.show.placeholder")}
        />
      </Card>
    </PanelLayout>
  );
}
