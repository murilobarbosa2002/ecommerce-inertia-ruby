import { Link } from "@inertiajs/react";
import { SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { button } from "@/components/shared/button/Button.variants";
import { edit_admin_role_path } from "@/routes";

import { type RoleRow } from "../Index.types";

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
