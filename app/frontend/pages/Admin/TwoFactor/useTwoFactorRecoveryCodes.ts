import { useState } from "react";
import { useTranslation } from "react-i18next";

import downloadRecoveryCodesImage from "@/lib/downloadRecoveryCodesImage";
import downloadTextFile from "@/lib/downloadTextFile";

// Estado (copied) + chamada assíncrona (clipboard) justificam o hook
// próprio, à parte da apresentação (docs/adr/0029) — mesmo padrão de
// usePasswordGenerator.ts.
export default function useTwoFactorRecoveryCodes(recoveryCodes: string[]) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(recoveryCodes.join("\n")).then(() => {
      setCopied(true);
    });
  };

  const handleDownloadTxt = () => {
    downloadTextFile("codigos-de-recuperacao.txt", recoveryCodes.join("\n"));
  };

  const handleDownloadImage = () => {
    downloadRecoveryCodesImage(
      recoveryCodes,
      t("admin.twoFactor.recoveryCodes.title"),
      "codigos-de-recuperacao.png",
    );
  };

  return { copied, handleCopy, handleDownloadTxt, handleDownloadImage };
}
