import { type ReactNode } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Banner from "@/components/shared/banner/Banner";
import Button from "@/components/shared/button/Button";
import Dialog from "@/components/shared/dialog/Dialog";
import Link from "@/components/shared/link/Link";
import ThemeToggle from "@/components/shared/theme-toggle/ThemeToggle";
import {
  admin_admins_path,
  admin_profile_path,
  admin_roles_path,
  admin_session_path,
  new_admin_two_factor_path,
} from "@/routes";
import { type FlashData, type SharedProps } from "@/types";

// Páginas do próprio fluxo de ativar o 2FA — o aviso obrigatório não
// aparece nelas, senão o próprio caminho pra resolver o aviso ficaria
// bloqueado visualmente por ele (docs/adr/0023).
const TWO_FACTOR_SETUP_PAGES = [
  "Admin/TwoFactor/New",
  "Admin/TwoFactor/RecoveryCodes",
];

export default function PanelLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const {
    props: pageProps,
    flash,
    component,
  } = usePage<SharedProps>() as {
    props: SharedProps;
    flash?: FlashData;
    component: string;
  };
  const { current_admin_permissions, current_admin_two_factor_enabled } =
    pageProps;
  const showTwoFactorRequiredDialog =
    !current_admin_two_factor_enabled &&
    !TWO_FACTOR_SETUP_PAGES.includes(component);

  const signOut = () => {
    router.delete(admin_session_path());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Head title={title} />

      <nav className="border-b border-gray-200 bg-white px-4 py-3 select-none dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("shared.panelLayout.brand")}
          </span>

          <div className="flex items-center gap-4">
            {current_admin_permissions.includes("manage_admins") && (
              <Link href={admin_admins_path()}>
                {t("shared.panelLayout.manageAdmins")}
              </Link>
            )}
            {current_admin_permissions.includes("manage_roles") && (
              <Link href={admin_roles_path()}>
                {t("shared.panelLayout.manageRoles")}
              </Link>
            )}
            <Link href={admin_profile_path()}>
              {t("shared.panelLayout.profile")}
            </Link>
            <ThemeToggle />
            <Button type="button" intent="ghost" onClick={signOut}>
              {t("shared.panelLayout.signOut")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {flash?.notice && <Banner tone="notice">{flash.notice}</Banner>}
        {flash?.alert && <Banner tone="alert">{flash.alert}</Banner>}
        {children}
      </main>

      <Dialog
        open={showTwoFactorRequiredDialog}
        title={t("shared.panelLayout.twoFactorRequiredTitle")}
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {t("shared.panelLayout.twoFactorRequiredDescription")}
        </p>
        <Link href={new_admin_two_factor_path()}>
          {t("shared.panelLayout.twoFactorRequiredButton")}
        </Link>
      </Dialog>
    </div>
  );
}
