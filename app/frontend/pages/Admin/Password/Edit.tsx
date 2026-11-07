import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";

import PasswordEditForm from "./components/PasswordEditForm";

export default function PasswordEdit({ token }: { token: string }) {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.password.edit.title")}>
      <Head title={t("admin.password.edit.title")} />

      <PasswordEditForm token={token} />
    </AuthLayout>
  );
}
