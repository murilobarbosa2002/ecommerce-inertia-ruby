import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";
import { link } from "@/components/admin/ui";
import { new_admin_password_path } from "@/routes";

import SessionNewForm from "./components/SessionNewForm";

export default function SessionNew() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.session.new.title")}>
      <Head title={t("admin.session.new.title")} />

      <SessionNewForm />

      <p className="mt-6 text-center text-sm">
        <a href={new_admin_password_path()} className={link()}>
          {t("admin.session.new.forgotPassword")}
        </a>
      </p>
    </AuthLayout>
  );
}
