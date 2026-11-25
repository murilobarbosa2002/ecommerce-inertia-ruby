import { Link } from "@inertiajs/react";
import { SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { button } from "@/components/shared/button/Button.variants";
import { edit_admin_role_path } from "@/routes";

import { type RoleRow } from "../Index.types";

// Drawer (mobile) tem a largura toda do painel — ação atrás de um menu ali
// seria pouco descobrível, então o botão fica com rótulo visível direto
// (achado real testando no navegador, ADR 0037).
export default function RoleRowActionsButton({ role }: { role: RoleRow }) {
  const { t } = useTranslation();

  return (
    <Link
      href={edit_admin_role_path(role.id)}
      className={button({ intent: "primary", fullWidth: true })}
    >
      <SquarePen className="size-4" aria-hidden="true" />
      {t("admin.roles.index.editLink")}
    </Link>
  );
}
