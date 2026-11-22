import { LayoutDashboard, ShieldCheck, Store, Users } from "lucide-react";

import { type NavSection } from "@/lib/navigation/navigation.types";
import {
  admin_admins_path,
  admin_roles_path,
  admin_store_setting_path,
  edit_admin_store_setting_path,
  root_path,
} from "@/routes";

// Menu do painel como dado: item novo entra aqui (com a permissão que exige),
// sem tocar na Sidebar. O perfil do admin fica no menu do usuário, não aqui.
const adminNavigation: NavSection[] = [
  {
    key: "general",
    labelKey: "shared.panelLayout.sections.general",
    items: [
      {
        key: "dashboard",
        labelKey: "shared.panelLayout.nav.dashboard",
        icon: LayoutDashboard,
        href: root_path,
      },
    ],
  },
  {
    key: "administration",
    labelKey: "shared.panelLayout.sections.administration",
    items: [
      {
        key: "admins",
        labelKey: "shared.panelLayout.nav.admins",
        icon: Users,
        href: admin_admins_path,
        permission: "manage_admins",
      },
      {
        key: "roles",
        labelKey: "shared.panelLayout.nav.roles",
        icon: ShieldCheck,
        href: admin_roles_path,
        permission: "manage_roles",
      },
      {
        key: "store-settings",
        labelKey: "shared.panelLayout.nav.storeSettings",
        icon: Store,
        href: edit_admin_store_setting_path,
        activePath: admin_store_setting_path,
        permission: "manage_store_settings",
      },
    ],
  },
];

export default adminNavigation;
