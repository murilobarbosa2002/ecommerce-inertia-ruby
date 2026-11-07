import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import AuthLayout from "@/components/admin/AuthLayout";
import Link from "@/components/shared/link/Link";
import { new_admin_session_path } from "@/routes";

import PasswordNewForm from "./components/PasswordNewForm";

export default function PasswordNew() {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t("admin.password.new.title")}>
      <Head title={t("admin.password.new.title")} />

      <PasswordNewForm />

      <p className="mt-6 text-center text-sm">
        <Link href={new_admin_session_path()}>
          {t("admin.password.new.backToLogin")}
        </Link>
      </p>
    </AuthLayout>
  );
}
