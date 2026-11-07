import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";
import Link from "@/components/shared/link/Link";
import { new_admin_password_path } from "@/routes";

import SessionNewForm from "./components/SessionNewForm";

export default function SessionNew() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.session.new.title")}>
      <Head title={t("admin.session.new.title")} />

      <SessionNewForm />

      <p className="mt-6 text-center text-sm">
        <Link href={new_admin_password_path()}>
          {t("admin.session.new.forgotPassword")}
        </Link>
      </p>
    </AuthLayout>
  );
}
