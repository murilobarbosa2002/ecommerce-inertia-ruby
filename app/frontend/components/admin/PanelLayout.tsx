import { type ReactNode } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Banner from "@/components/shared/banner/Banner";
import Button from "@/components/shared/button/Button";
import Link from "@/components/shared/link/Link";
import ThemeToggle from "@/components/shared/theme-toggle/ThemeToggle";
import { admin_admins_path, admin_session_path } from "@/routes";
import { type FlashData, type SharedProps } from "@/types";

export default function PanelLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { props: pageProps, flash } = usePage<SharedProps>() as {
    props: SharedProps;
    flash?: FlashData;
  };
  const { current_admin_permissions } = pageProps;

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
    </div>
  );
}
