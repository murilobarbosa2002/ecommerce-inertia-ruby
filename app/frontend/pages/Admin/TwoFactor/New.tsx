import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";

import TwoFactorNewForm from "./components/TwoFactorNewForm";

export default function TwoFactorNew({
  provisioning_uri,
  qr_code_svg,
}: {
  provisioning_uri: string;
  qr_code_svg: string;
}) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.twoFactor.new.title")}>
      <Head title={t("admin.twoFactor.new.title")} />

      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.twoFactor.new.title")}
      </h1>
      <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
        {t("admin.twoFactor.new.description")}
      </p>

      {/* qr_code_svg vem de RQRCode (RQRCode::QRCode#as_svg), gerado no
      servidor a partir de provisioning_uri — nunca conteúdo de usuário. */}
      <div
        className="mb-4 w-fit rounded-lg bg-white p-4"
        dangerouslySetInnerHTML={{ __html: qr_code_svg }}
      />

      <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
        {t("admin.twoFactor.new.qrCodeInstructions")}
      </p>
      <code className="mb-6 block w-fit rounded-sm bg-gray-100 px-3 py-2 text-sm break-all text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        {provisioning_uri}
      </code>

      <TwoFactorNewForm />
    </PanelLayout>
  );
}
