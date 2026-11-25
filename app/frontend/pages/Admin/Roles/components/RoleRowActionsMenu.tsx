import { Link } from "@inertiajs/react";
import { EllipsisVertical, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import DropdownMenu from "@/components/shared/dropdown-menu/DropdownMenu";
import DropdownMenuContent from "@/components/shared/dropdown-menu/dropdown-menu-content/DropdownMenuContent";
import DropdownMenuItem from "@/components/shared/dropdown-menu/dropdown-menu-item/DropdownMenuItem";
import DropdownMenuTrigger from "@/components/shared/dropdown-menu/dropdown-menu-trigger/DropdownMenuTrigger";
import { edit_admin_role_path } from "@/routes";

import { type RoleRow } from "../Index.types";

export default function RoleRowActionsMenu({ role }: { role: RoleRow }) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          type="button"
          intent="ghost"
          size="icon"
          aria-label={t("admin.roles.index.rowActionsLabel")}
        >
          <EllipsisVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={edit_admin_role_path(role.id)}>
            <SquarePen className="size-4" aria-hidden="true" />
            {t("admin.roles.index.editLink")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
