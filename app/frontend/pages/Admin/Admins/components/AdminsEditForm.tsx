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
        id="first_name"
        type="text"
        autoComplete="given-name"
        label={t("admin.admins.edit.firstNameLabel")}
        error={
          errors.first_name
            ? t("admin.admins.edit.firstNameRequired")
            : undefined
        }
        register={register("first_name")}
      />

      <FormField
        id="last_name"
        type="text"
        autoComplete="family-name"
        label={t("admin.admins.edit.lastNameLabel")}
        error={
          errors.last_name ? t("admin.admins.edit.lastNameRequired") : undefined
        }
        register={register("last_name")}
      />

      <FormField
        id="phone"
        type="tel"
        autoComplete="tel-national"
        label={t("admin.admins.edit.phoneLabel")}
        error={errors.phone ? t("admin.admins.edit.phoneInvalid") : undefined}
        register={register("phone")}
      />

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

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.admins.edit.submitting")
          : t("admin.admins.edit.submit")}
      </Button>
    </form>
  );
}
