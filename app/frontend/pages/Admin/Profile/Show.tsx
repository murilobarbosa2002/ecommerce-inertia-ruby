import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import PageHeader from "@/components/admin/page-header/PageHeader";
import Link from "@/components/shared/link/Link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/tabs/Tabs";
import { new_admin_two_factor_path } from "@/routes";

import ChangePasswordForm from "./components/ChangePasswordForm";
import DisableTwoFactorForm from "./components/DisableTwoFactorForm";
import { type ProfileShowProps } from "./Show.types";

export default function ProfileShow({ two_factor_enabled }: ProfileShowProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.profile.title")}>
      <Head title={t("admin.profile.title")} />

      <PageHeader
        title={t("admin.profile.title")}
        description={t("admin.profile.description")}
      />

      <Tabs defaultValue="two-factor">
        <TabsList>
          <TabsTrigger value="two-factor">
            {t("admin.profile.tabs.twoFactor")}
          </TabsTrigger>
          <TabsTrigger value="change-password">
            {t("admin.profile.tabs.changePassword")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="two-factor">
          {two_factor_enabled ? (
            <>
              <p className="mb-3 text-sm text-fg-muted">
                {t("admin.profile.twoFactorEnabled")}
              </p>
              <DisableTwoFactorForm />
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-fg-muted">
                {t("admin.profile.twoFactorDisabled")}
              </p>
              <Link href={new_admin_two_factor_path()}>
                {t("admin.profile.enableTwoFactorLink")}
              </Link>
            </>
          )}
        </TabsContent>

        <TabsContent value="change-password">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </PanelLayout>
  );
}
