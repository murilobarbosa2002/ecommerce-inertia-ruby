import { Link } from "@inertiajs/react";
import { ShieldOff, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import { button } from "@/components/shared/button/Button.variants";
import { edit_admin_admin_path } from "@/routes";

import { type AdminRow } from "../Index.types";
import useAdminRowActions from "./useAdminRowActions";

// Drawer (mobile) tem a largura toda do painel — ação atrás de um menu ali
// seria pouco descobrível, então os botões ficam com rótulo visível direto
// (achado real testando no navegador, ADR 0037).
export default function AdminRowActionsButtons({ admin }: { admin: AdminRow }) {
  const { t } = useTranslation();
  const { canResetTwoFactor, resetTwoFactor } = useAdminRowActions(admin);

  return (
    <>
      <Link
        href={edit_admin_admin_path(admin.id)}
        className={button({ intent: "primary", fullWidth: true })}
      >
        <SquarePen className="size-4" aria-hidden="true" />
        {t("admin.admins.index.editLink")}
      </Link>
      {canResetTwoFactor && (
        <Button
          type="button"
          intent="outline"
          fullWidth
          onClick={resetTwoFactor}
        >
          <ShieldOff className="size-4" aria-hidden="true" />
          {t("admin.admins.edit.resetTwoFactorButton")}
        </Button>
      )}
    </>
  );
}
