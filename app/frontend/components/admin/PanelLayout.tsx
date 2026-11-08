import { type ReactNode } from "react";
import { Head, router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import ThemeToggle from "@/components/shared/theme-toggle/ThemeToggle";
import { admin_session_path } from "@/routes";

export default function PanelLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  const signOut = () => {
    router.delete(admin_session_path());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Head title={title} />

      <nav className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("shared.panelLayout.brand")}
          </span>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {t("shared.panelLayout.signOut")}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
