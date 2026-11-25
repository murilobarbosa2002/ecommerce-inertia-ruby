import { router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import { reset_two_factor_admin_admin_path } from "@/routes";
import { type SharedProps } from "@/types";

import { type AdminRow } from "../Index.types";

// Mesma lógica de permissão/confirmação do ResetTwoFactorButton (tela de
// editar) — compartilhada entre AdminRowActionsMenu (tabela) e
// AdminRowActionsButtons (Drawer), nenhum dos dois repete.
export default function useAdminRowActions(admin: AdminRow) {
  const { t } = useTranslation();
  const {
    props: { current_admin_permissions, current_admin_id },
  } = usePage<SharedProps>();

  const canResetTwoFactor =
    current_admin_permissions.includes("reset_two_factor") &&
    admin.id !== current_admin_id;

  const resetTwoFactor = () => {
    if (window.confirm(t("admin.admins.edit.resetTwoFactorConfirm"))) {
      router.post(reset_two_factor_admin_admin_path(admin.id));
    }
  };

  return { canResetTwoFactor, resetTwoFactor };
}
