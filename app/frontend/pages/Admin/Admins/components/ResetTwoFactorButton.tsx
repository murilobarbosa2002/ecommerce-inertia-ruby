import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import ConfirmDialog from "@/components/shared/confirm-dialog/ConfirmDialog";
import { reset_two_factor_admin_admin_path } from "@/routes";
import { type SharedProps } from "@/types";

import { type ResetTwoFactorButtonProps } from "../Edit.types";

export default function ResetTwoFactorButton({
  adminId,
}: ResetTwoFactorButtonProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const {
    props: { current_admin_permissions, current_admin_id },
  } = usePage<SharedProps>();

  const canResetTwoFactor =
    current_admin_permissions.includes("reset_two_factor") &&
    adminId !== current_admin_id;

  if (!canResetTwoFactor) return null;

  return (
    <p className="mt-6">
      <Button
        type="button"
        intent="ghost"
        onClick={() => {
          setConfirmOpen(true);
        }}
      >
        {t("admin.admins.edit.resetTwoFactorButton")}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("admin.admins.edit.resetTwoFactorConfirmTitle")}
        description={t("admin.admins.edit.resetTwoFactorConfirm")}
        confirmLabel={t("admin.admins.edit.resetTwoFactorButton")}
        cancelLabel={t("shared.confirmDialog.cancel")}
        confirmIntent="danger"
        onConfirm={() => {
          router.post(reset_two_factor_admin_admin_path(adminId));
        }}
      />
    </p>
  );
}
