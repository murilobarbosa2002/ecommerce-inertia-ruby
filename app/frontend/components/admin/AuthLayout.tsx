import { type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { Store } from "lucide-react";
import { useTranslation } from "react-i18next";

import GradientBackdrop from "@/components/motion/GradientBackdrop";
import Reveal from "@/components/motion/Reveal";
import Banner from "@/components/shared/banner/Banner";
import { type FlashData, type SharedProps } from "@/types";

// `flash` é campo próprio do objeto de página do Inertia (`usePage().flash`),
// não um prop (`usePage().props.flash` sempre undefined). Só existe quando
// há notice/alert — `as` corrige o tipo de @inertiajs/core, que o declara
// como sempre presente. `props.store` já é compartilhado nas páginas
// pré-autenticação (AdminPanel::BaseController#store_json), mesmo sem
// Current.admin — só current_admin/permissões é que ficam vazios aqui.
export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { flash, props: pageProps } = usePage() as {
    flash?: FlashData;
    props?: SharedProps;
  };
  const brandName = pageProps?.store?.name ?? t("shared.panelLayout.brand");
  const logoUrl = pageProps?.store?.logo_url ?? null;

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Painel de marca: só em telas largas — no celular não há espaço
          pra duas colunas sem apertar o formulário, que é o que importa
          de verdade nessas páginas. */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-surface lg:flex">
        <GradientBackdrop />
        <div className="relative flex flex-col items-center gap-4 text-center select-none">
          <span className="flex size-16 items-center justify-center overflow-hidden rounded-card bg-accent text-accent-fg">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Store className="size-8" aria-hidden="true" />
            )}
          </span>
          <span className="max-w-xs truncate text-2xl font-semibold text-fg">
            {brandName}
          </span>
        </div>
      </div>

      <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
        <Reveal
          direction="up"
          className="w-full max-w-sm rounded-card border border-line bg-surface p-8 shadow-card"
        >
          <div className="mb-6 text-center select-none">
            <h1 className="text-xl font-semibold tracking-tight text-fg">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-fg-muted">{description}</p>
            )}
          </div>

          {flash?.notice && <Banner tone="notice">{flash.notice}</Banner>}
          {flash?.alert && <Banner tone="alert">{flash.alert}</Banner>}

          {children}
        </Reveal>
      </main>
    </div>
  );
}
