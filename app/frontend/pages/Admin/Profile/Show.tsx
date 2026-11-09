import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Link from "@/components/shared/link/Link";
import { new_admin_two_factor_path } from "@/routes";

import ChangePasswordForm from "./components/ChangePasswordForm";
import DisableTwoFactorForm from "./components/DisableTwoFactorForm";
import { type ProfileShowProps } from "./Show.types";

export default function ProfileShow({ two_factor_enabled }: ProfileShowProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.profile.title")}>
      <Head title={t("admin.profile.title")} />

      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.profile.title")}
      </h1>

      <section className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          {t("admin.profile.twoFactorTitle")}
        </h2>
        {two_factor_enabled ? (
          <>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t("admin.profile.twoFactorEnabled")}
            </p>
            <DisableTwoFactorForm />
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t("admin.profile.twoFactorDisabled")}
            </p>
            <Link href={new_admin_two_factor_path()}>
              {t("admin.profile.enableTwoFactorLink")}
            </Link>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          {t("admin.profile.changePasswordTitle")}
        </h2>
        <ChangePasswordForm />
      </section>
    </PanelLayout>
  );
}
