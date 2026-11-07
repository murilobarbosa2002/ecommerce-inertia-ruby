import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";
import { link } from "@/components/admin/ui";
import { new_admin_session_path } from "@/routes";

import PasswordNewForm from "./components/PasswordNewForm";

export default function PasswordNew() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.password.new.title")}>
      <Head title={t("admin.password.new.title")} />

      <PasswordNewForm />

      <p className="mt-6 text-center text-sm">
        <a href={new_admin_session_path()} className={link()}>
          {t("admin.password.new.backToLogin")}
        </a>
      </p>
    </AuthLayout>
  );
}
