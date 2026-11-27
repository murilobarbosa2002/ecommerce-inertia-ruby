import { useState } from "react";
import { Link } from "@inertiajs/react";
import { EllipsisVertical, ShieldOff, SquarePen, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import DropdownMenu from "@/components/shared/dropdown-menu/DropdownMenu";
import DropdownMenuContent from "@/components/shared/dropdown-menu/dropdown-menu-content/DropdownMenuContent";
import DropdownMenuItem from "@/components/shared/dropdown-menu/dropdown-menu-item/DropdownMenuItem";
import DropdownMenuTrigger from "@/components/shared/dropdown-menu/dropdown-menu-trigger/DropdownMenuTrigger";
import { edit_admin_admin_path } from "@/routes";

import { type AdminRow } from "../Index.types";
import DeleteAdminDialog from "./DeleteAdminDialog";
import useAdminRowActions from "./useAdminRowActions";

export default function AdminRowActionsMenu({ admin }: { admin: AdminRow }) {
  const { t } = useTranslation();
  const { canResetTwoFactor, canDelete, resetTwoFactor } =
    useAdminRowActions(admin);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            type="button"
            intent="ghost"
            size="icon"
            aria-label={t("admin.admins.index.rowActionsLabel")}
          >
            <EllipsisVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={edit_admin_admin_path(admin.id)}>
              <SquarePen className="size-4" aria-hidden="true" />
              {t("admin.admins.index.editLink")}
            </Link>
          </DropdownMenuItem>
          {canResetTwoFactor && (
            <DropdownMenuItem onSelect={resetTwoFactor}>
              <ShieldOff className="size-4" aria-hidden="true" />
              {t("admin.admins.edit.resetTwoFactorButton")}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onSelect={() => {
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t("admin.admins.destroy.deleteButton")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {canDelete && (
        <DeleteAdminDialog
          adminId={admin.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
