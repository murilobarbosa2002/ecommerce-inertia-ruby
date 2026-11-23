import { ShieldPlus, Store, UserPlus } from "lucide-react";

import { type QuickAction } from "@/lib/quick-actions/quickActions.types";
import {
  edit_admin_store_setting_path,
  new_admin_admin_path,
  new_admin_role_path,
} from "@/routes";

// Catálogo de atalhos disponíveis pro dashboard — item novo entra aqui,
// sem tocar em QuickActions nem no diálogo de configurar. O backend não
// conhece este catálogo (AdminPanel::QuickActionsController só guarda a
// lista de chaves escolhidas); ele é a única fonte de verdade do que cada
// chave significa.
const quickActions: QuickAction[] = [
  {
    key: "new_admin",
    labelKey: "admin.dashboard.show.quickActions.newAdmin",
    icon: UserPlus,
    href: new_admin_admin_path,
    permission: "manage_admins",
  },
  {
    key: "new_role",
    labelKey: "admin.dashboard.show.quickActions.newRole",
    icon: ShieldPlus,
    href: new_admin_role_path,
    permission: "manage_roles",
  },
  {
    key: "store_settings",
    labelKey: "admin.dashboard.show.quickActions.storeSettings",
    icon: Store,
    href: edit_admin_store_setting_path,
    permission: "manage_store_settings",
  },
];

export default quickActions;
