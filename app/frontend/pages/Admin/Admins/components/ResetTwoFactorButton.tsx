import { router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import { reset_two_factor_admin_admin_path } from "@/routes";
import { type SharedProps } from "@/types";

import { type ResetTwoFactorButtonProps } from "../Edit.types";

export default function ResetTwoFactorButton({
  adminId,
}: ResetTwoFactorButtonProps) {
  const { t } = useTranslation();
  const {
    props: { current_admin_permissions, current_admin_id },
  } = usePage<SharedProps>();

  const canResetTwoFactor =
    current_admin_permissions.includes("reset_two_factor") &&
    adminId !== current_admin_id;

  if (!canResetTwoFactor) return null;

  const resetTwoFactor = () => {
    if (window.confirm(t("admin.admins.edit.resetTwoFactorConfirm"))) {
      router.post(reset_two_factor_admin_admin_path(adminId));
    }
  };

  return (
    <p className="mt-6">
      <Button type="button" intent="ghost" onClick={resetTwoFactor}>
        {t("admin.admins.edit.resetTwoFactorButton")}
      </Button>
    </p>
  );
}
