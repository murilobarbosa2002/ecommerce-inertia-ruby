import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";
import Select from "@/components/shared/select/Select";

import useAdminsEditForm from "../useAdminsEditForm";

interface AdminToEdit {
  id: number;
  email_address: string;
  role_id: number;
}

export default function AdminsEditForm({
  admin,
  roles,
}: {
  admin: AdminToEdit;
  roles: { id: number; name: string }[];
}) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit, control } =
    useAdminsEditForm(admin);

  const roleOptions = roles.map((role) => ({
    value: String(role.id),
    label: role.name,
  }));

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="space-y-5"
      noValidate
    >
      <div>
        <Label htmlFor="email_address">
          {t("admin.admins.edit.emailLabel")}
        </Label>
        <Input
          id="email_address"
          type="email"
          autoComplete="email"
          invalid={!!errors.email_address}
          {...register("email_address")}
        />
        {errors.email_address && (
          <FieldError>{t("admin.admins.edit.emailRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="role_id">{t("admin.admins.edit.roleLabel")}</Label>
        <Controller
          name="role_id"
          control={control}
          render={({ field }) => (
            <Select
              id="role_id"
              options={roleOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t("admin.admins.edit.rolePlaceholder")}
            />
          )}
        />
        {errors.role_id && (
          <FieldError>{t("admin.admins.edit.roleRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="change_reason">
          {t("admin.admins.edit.changeReasonLabel")}
        </Label>
        <Input
          id="change_reason"
          type="text"
          invalid={!!errors.change_reason}
          {...register("change_reason")}
        />
        {errors.change_reason && (
          <FieldError>{t("admin.admins.edit.changeReasonRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.admins.edit.submitting")
          : t("admin.admins.edit.submit")}
      </Button>
    </form>
  );
}
