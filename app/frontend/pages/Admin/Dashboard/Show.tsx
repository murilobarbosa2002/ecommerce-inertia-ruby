import { Head, usePage } from "@inertiajs/react";
import { Lock, ShieldOff, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import ActivityFeed from "@/components/admin/activity-feed/ActivityFeed";
import PageHeader from "@/components/admin/page-header/PageHeader";
import QuickActions from "@/components/admin/quick-actions/QuickActions";
import StatCard from "@/components/admin/stat-card/StatCard";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Card from "@/components/shared/card/Card";
import { type SharedProps } from "@/types";

import { type DashboardShowProps } from "./Show.types";

export default function DashboardShow({
  stats,
  activity,
  quick_action_keys: quickActionKeys,
}: DashboardShowProps) {
  const { t } = useTranslation();
  const {
    props: { current_admin_permissions },
  } = usePage<SharedProps>();

  return (
    <PanelLayout title={t("admin.dashboard.show.title")}>
      <Head title={t("admin.dashboard.show.title")} />

      <PageHeader
        title={t("admin.dashboard.show.title")}
        description={t("admin.dashboard.show.description")}
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label={t("admin.dashboard.show.stats.totalAdmins")}
          value={stats.total_admins}
        />
        <StatCard
          icon={ShieldOff}
          label={t("admin.dashboard.show.stats.adminsWithoutTwoFactor")}
          value={stats.admins_without_two_factor}
        />
        <StatCard
          icon={Lock}
          label={t("admin.dashboard.show.stats.lockedAdmins")}
          value={stats.locked_admins}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="order-2 lg:order-0 lg:col-span-2">
          {activity && (
            <Card>
              <ActivityFeed activity={activity} />
            </Card>
          )}
        </div>

        <QuickActions
          className="order-1 lg:order-0"
          permissions={current_admin_permissions}
          quickActionKeys={quickActionKeys}
        />
      </div>
    </PanelLayout>
  );
}
