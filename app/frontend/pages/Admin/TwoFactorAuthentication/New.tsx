import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";

import TwoFactorAuthenticationNewForm from "./components/TwoFactorAuthenticationNewForm";

export default function TwoFactorAuthenticationNew() {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t("admin.twoFactorAuthentication.new.title")}
      description={t("admin.twoFactorAuthentication.new.description")}
    >
      <Head title={t("admin.twoFactorAuthentication.new.title")} />

      <TwoFactorAuthenticationNewForm />
    </AuthLayout>
  );
}
