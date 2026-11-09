import { Head, router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import PanelLayout from "@/components/admin/PanelLayout";
import Button from "@/components/shared/button/Button";
import downloadRecoveryCodesImage from "@/lib/downloadRecoveryCodesImage";
import downloadTextFile from "@/lib/downloadTextFile";
import { root_path } from "@/routes";

export default function TwoFactorRecoveryCodes({
  recovery_codes,
}: {
  recovery_codes: string[];
}) {
  const { t } = useTranslation();

  const handleDownloadTxt = () => {
    downloadTextFile("codigos-de-recuperacao.txt", recovery_codes.join("\n"));
  };

  const handleDownloadImage = () => {
    downloadRecoveryCodesImage(
      recovery_codes,
      t("admin.twoFactor.recoveryCodes.title"),
      "codigos-de-recuperacao.png",
    );
  };

  return (
    <PanelLayout title={t("admin.twoFactor.recoveryCodes.title")}>
      <Head title={t("admin.twoFactor.recoveryCodes.title")} />

      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("admin.twoFactor.recoveryCodes.title")}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {t("admin.twoFactor.recoveryCodes.description")}
      </p>
      <p className="mt-1 mb-6 text-sm font-medium text-red-600 dark:text-red-400">
        {t("admin.twoFactor.recoveryCodes.warning")}
      </p>

      <ul className="mb-6 grid grid-cols-2 gap-2">
        {recovery_codes.map((code) => (
          <li
            key={code}
            className="rounded-sm bg-gray-100 px-3 py-2 text-center font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          >
            {code}
          </li>
        ))}
      </ul>

      <div className="mb-4 flex gap-3">
        <Button type="button" intent="ghost" onClick={handleDownloadTxt}>
          {t("admin.twoFactor.recoveryCodes.downloadTxt")}
        </Button>
        <Button type="button" intent="ghost" onClick={handleDownloadImage}>
          {t("admin.twoFactor.recoveryCodes.downloadImage")}
        </Button>
      </div>

      <Button
        type="button"
        onClick={() => {
          router.visit(root_path());
        }}
      >
        {t("admin.twoFactor.recoveryCodes.continueButton")}
      </Button>
    </PanelLayout>
  );
}
