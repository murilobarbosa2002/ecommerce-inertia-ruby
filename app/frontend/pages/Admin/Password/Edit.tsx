import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";

import PasswordEditForm from "./components/PasswordEditForm";
import { type PasswordEditProps } from "./Edit.types";

export default function PasswordEdit({ token }: PasswordEditProps) {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.password.edit.title")}>
      <Head title={t("admin.password.edit.title")} />

      <PasswordEditForm token={token} />
    </AuthLayout>
  );
}
