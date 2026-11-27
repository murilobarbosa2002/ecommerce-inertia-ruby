import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Dialog from "@/components/shared/dialog/Dialog";
import FormField from "@/components/shared/form-field/FormField";

import useDeleteAdminForm from "./useDeleteAdminForm";

export default function DeleteAdminDialog({
  adminId,
  open,
  onOpenChange,
}: {
  adminId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit, reset } =
    useDeleteAdminForm(adminId);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title={t("admin.admins.destroy.dialogTitle")}
      description={t("admin.admins.destroy.dialogDescription")}
    >
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          id="delete_admin_password"
          type="password"
          autoComplete="current-password"
          label={t("admin.admins.destroy.passwordLabel")}
          error={
            errors.password
              ? t("admin.admins.destroy.passwordRequired")
              : undefined
          }
          register={register("password")}
        />
        <FormField
          id="delete_admin_change_reason"
          type="text"
          label={t("admin.admins.destroy.changeReasonLabel")}
          error={
            errors.change_reason
              ? t("admin.admins.destroy.changeReasonRequired")
              : undefined
          }
          register={register("change_reason")}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            intent="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("shared.confirmDialog.cancel")}
          </Button>
          <Button type="submit" intent="danger" disabled={isSubmitting}>
            {isSubmitting
              ? t("admin.admins.destroy.submitting")
              : t("admin.admins.destroy.submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
