import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import FormField from "@/components/shared/form-field/FormField";
import Label from "@/components/shared/label/Label";
import Select from "@/components/shared/select/Select";

import { type AdminsEditProps } from "../Edit.types";
import useAdminsEditForm from "../useAdminsEditForm";

export default function AdminsEditForm({ admin, roles }: AdminsEditProps) {
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
      <FormField
        id="email_address"
        type="email"
        autoComplete="email"
        label={t("admin.admins.edit.emailLabel")}
        error={
          errors.email_address
            ? t("admin.admins.edit.emailRequired")
            : undefined
        }
        register={register("email_address")}
      />

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

      <FormField
        id="change_reason"
        type="text"
        label={t("admin.admins.edit.changeReasonLabel")}
        error={
          errors.change_reason
            ? t("admin.admins.edit.changeReasonRequired")
            : undefined
        }
        register={register("change_reason")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.admins.edit.submitting")
          : t("admin.admins.edit.submit")}
      </Button>
    </form>
  );
}
