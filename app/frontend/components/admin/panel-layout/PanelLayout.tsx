import { type ReactNode, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import MobileNav from "@/components/admin/mobile-nav/MobileNav";
import Sidebar from "@/components/admin/sidebar/Sidebar";
import Topbar from "@/components/admin/topbar/Topbar";
import UserMenu from "@/components/admin/user-menu/UserMenu";
import Dialog from "@/components/shared/dialog/Dialog";
import Link from "@/components/shared/link/Link";
import ThemeToggle from "@/components/shared/theme-toggle/ThemeToggle";
import Toast, { ToastProvider } from "@/components/shared/toast/Toast";
import adminNavigation from "@/config/adminNavigation";
import useSidebarState from "@/hooks/useSidebarState";
import filterNavigation from "@/lib/navigation/filterNavigation";
import findActiveNavItem from "@/lib/navigation/findActiveNavItem";
import {
  admin_profile_path,
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
    url,
  } = usePage<SharedProps>() as {
    props: SharedProps;
    flash?: FlashData;
    component: string;
    url?: string;
  };
  const {
    current_admin_permissions,
    current_admin_two_factor_enabled,
    current_admin,
    store,
  } = pageProps;
  const { collapsed, toggleCollapsed } = useSidebarState();

  // Guardado em estado (em vez de ler `flash` direto): o toast some depois
  // de alguns segundos ou ao ser fechado, mas `flash` só muda numa próxima
  // navegação Inertia — sem estado próprio, ele reapareceria sozinho a cada
  // rerender enquanto a página não mudasse. Ajustado durante o render (não
  // em useEffect) comparando com o último valor visto — padrão recomendado
  // pra "resposta a uma mudança de prop" que não é sincronização com
  // sistema externo; usa useState (não ref) pro valor anterior porque o
  // ref-lint deste projeto proíbe ler/escrever ref durante o render.
  const [noticeToast, setNoticeToast] = useState<string | null>(null);
  const [alertToast, setAlertToast] = useState<string | null>(null);
  const [lastNotice, setLastNotice] = useState<string | undefined>(undefined);
  const [lastAlert, setLastAlert] = useState<string | undefined>(undefined);

  if (flash?.notice && flash.notice !== lastNotice) {
    setLastNotice(flash.notice);
    setNoticeToast(flash.notice);
  }

  if (flash?.alert && flash.alert !== lastAlert) {
    setLastAlert(flash.alert);
    setAlertToast(flash.alert);
  }

  const showTwoFactorRequiredDialog =
    !current_admin_two_factor_enabled &&
    !TWO_FACTOR_SETUP_PAGES.includes(component);

  const sections = filterNavigation(adminNavigation, current_admin_permissions);
  const active = findActiveNavItem(sections, url ?? "");
  const breadcrumbs = active
    ? [t(active.section.labelKey), t(active.item.labelKey)]
    : [title];
  const brandName = store?.name ?? t("shared.panelLayout.brand");
  const logoUrl = store?.logo_url ?? null;

  const signOut = () => {
    router.delete(admin_session_path());
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-fg lg:flex">
        <Head title={title} />

        <Sidebar
          sections={sections}
          activeItemKey={active?.item.key ?? null}
          brandName={brandName}
          logoUrl={logoUrl}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            breadcrumbs={breadcrumbs}
            leading={
              <MobileNav
                sections={sections}
                activeItemKey={active?.item.key ?? null}
                brandName={brandName}
                logoUrl={logoUrl}
              />
            }
          >
            <ThemeToggle />
            <UserMenu
              name={
                current_admin
                  ? `${current_admin.first_name} ${current_admin.last_name}`
                  : ""
              }
              email={current_admin?.email_address ?? ""}
              roleName={current_admin?.role_name ?? ""}
              profileHref={admin_profile_path()}
              onSignOut={signOut}
            />
          </Topbar>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>

        <Toast
          tone="notice"
          open={noticeToast !== null}
          onOpenChange={(open) => {
            if (!open) setNoticeToast(null);
          }}
        >
          {noticeToast}
        </Toast>
        <Toast
          tone="alert"
          open={alertToast !== null}
          onOpenChange={(open) => {
            if (!open) setAlertToast(null);
          }}
        >
          {alertToast}
        </Toast>

        <Dialog
          open={showTwoFactorRequiredDialog}
          title={t("shared.panelLayout.twoFactorRequiredTitle")}
          description={t("shared.panelLayout.twoFactorRequiredDescription")}
        >
          <Link href={new_admin_two_factor_path()}>
            {t("shared.panelLayout.twoFactorRequiredButton")}
          </Link>
        </Dialog>
      </div>
    </ToastProvider>
  );
}
