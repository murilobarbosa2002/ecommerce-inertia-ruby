import { Head, router } from "@inertiajs/react";
import { Copy, FileDown, ImageDown, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import StaggerGroup from "@/components/motion/StaggerGroup";
import StaggerItem from "@/components/motion/StaggerItem";
import Button from "@/components/shared/button/Button";
import Card from "@/components/shared/card/Card";
import { root_path } from "@/routes";

import { type RecoveryCodesProps } from "./RecoveryCodes.types";
import useTwoFactorRecoveryCodes from "./useTwoFactorRecoveryCodes";

export default function TwoFactorRecoveryCodes({
  recovery_codes,
}: RecoveryCodesProps) {
  const { t } = useTranslation();
  const { copied, handleCopy, handleDownloadTxt, handleDownloadImage } =
    useTwoFactorRecoveryCodes(recovery_codes);

  return (
    <PanelLayout title={t("admin.twoFactor.recoveryCodes.title")}>
      <Head title={t("admin.twoFactor.recoveryCodes.title")} />

      <PageHeader
        title={t("admin.twoFactor.recoveryCodes.title")}
        description={t("admin.twoFactor.recoveryCodes.description")}
      />

      <Reveal direction="up" duration={0.4}>
        <Card>
          <div className="mb-6 flex items-start gap-2.5 rounded-control border border-danger-text/30 bg-danger-soft px-3.5 py-3 text-sm text-danger-text">
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{t("admin.twoFactor.recoveryCodes.warning")}</span>
          </div>

          <StaggerGroup as="ul" className="mb-6 grid grid-cols-2 gap-2">
            {recovery_codes.map((code) => (
              <StaggerItem
                as="li"
                key={code}
                className="rounded-control border border-line bg-canvas px-3 py-2.5 text-center font-mono text-sm text-fg"
              >
                {code}
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mb-5 flex flex-wrap gap-3">
            <Button type="button" intent="outline" onClick={handleCopy}>
              <Copy className="size-4" aria-hidden="true" />
              {copied
                ? t("admin.twoFactor.recoveryCodes.copied")
                : t("admin.twoFactor.recoveryCodes.copy")}
            </Button>
            <Button type="button" intent="outline" onClick={handleDownloadTxt}>
              <FileDown className="size-4" aria-hidden="true" />
              {t("admin.twoFactor.recoveryCodes.downloadTxt")}
            </Button>
            <Button
              type="button"
              intent="outline"
              onClick={handleDownloadImage}
            >
              <ImageDown className="size-4" aria-hidden="true" />
              {t("admin.twoFactor.recoveryCodes.downloadImage")}
            </Button>
          </div>

          <Button
            type="button"
            fullWidth
            onClick={() => {
              router.visit(root_path());
            }}
          >
            {t("admin.twoFactor.recoveryCodes.continueButton")}
          </Button>
        </Card>
      </Reveal>
    </PanelLayout>
  );
}
