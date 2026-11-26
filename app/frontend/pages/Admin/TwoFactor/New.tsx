import { Head } from "@inertiajs/react";
import { Info, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/admin/page-header/PageHeader";
import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import Reveal from "@/components/motion/Reveal";
import Card from "@/components/shared/card/Card";

import TwoFactorNewForm from "./components/TwoFactorNewForm";
import { type TwoFactorNewProps } from "./New.types";

export default function TwoFactorNew({
  provisioning_uri,
  qr_code_svg,
}: TwoFactorNewProps) {
  const { t } = useTranslation();

  return (
    <PanelLayout title={t("admin.twoFactor.new.title")}>
      <Head title={t("admin.twoFactor.new.title")} />

      <PageHeader
        title={t("admin.twoFactor.new.title")}
        description={t("admin.twoFactor.new.description")}
      />

      <Card>
        <div className="grid gap-8 md:grid-cols-2">
          <Reveal direction="left" duration={0.4}>
            <div className="flex h-full flex-col items-center gap-4 rounded-control border border-line bg-canvas p-6 text-center">
              {/* qr_code_svg vem de RQRCode (RQRCode::QRCode#as_svg), gerado
              no servidor a partir de provisioning_uri — nunca conteúdo de
              usuário. */}
              <div
                className="w-fit rounded-lg bg-white p-4"
                dangerouslySetInnerHTML={{ __html: qr_code_svg }}
              />

              <div className="w-full text-left">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
                  <KeyRound className="size-3.5" aria-hidden="true" />
                  {t("admin.twoFactor.new.qrCodeInstructions")}
                </p>
                <code className="block w-full rounded-control border border-line bg-surface-muted px-3 py-2 text-xs break-all text-fg">
                  {provisioning_uri}
                </code>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" duration={0.4} delay={0.1}>
            <div className="flex h-full flex-col justify-center gap-5">
              <div className="flex items-start gap-2.5 rounded-control border border-info-text/30 bg-info-soft px-3.5 py-3 text-sm text-info-text">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{t("admin.twoFactor.new.afterConfirmInfo")}</span>
              </div>

              <TwoFactorNewForm />
            </div>
          </Reveal>
        </div>
      </Card>
    </PanelLayout>
  );
}
