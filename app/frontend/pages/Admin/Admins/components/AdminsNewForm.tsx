import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import FormField from "@/components/shared/form-field/FormField";
import Label from "@/components/shared/label/Label";
import PasswordGenerator from "@/components/shared/password-generator/PasswordGenerator";
import Select from "@/components/shared/select/Select";

import { type AdminsNewProps } from "../New.types";
import useAdminsNewForm from "../useAdminsNewForm";

export default function AdminsNewForm({ roles }: AdminsNewProps) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit, setValue, control } =
    useAdminsNewForm();

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
        label={t("admin.admins.new.emailLabel")}
        error={
          errors.email_address ? t("admin.admins.new.emailRequired") : undefined
        }
        register={register("email_address")}
      />

      <PasswordGenerator
        onGenerate={(password) => {
          setValue("password", password, { shouldValidate: true });
          setValue("password_confirmation", password, {
            shouldValidate: true,
          });
        }}
      />

      <FormField
        id="password"
        type="password"
        autoComplete="new-password"
        label={t("admin.admins.new.passwordLabel")}
        error={
          errors.password ? t("admin.admins.new.passwordRequired") : undefined
        }
        register={register("password")}
      />

      <FormField
        id="password_confirmation"
        type="password"
        autoComplete="new-password"
        label={t("admin.admins.new.passwordConfirmationLabel")}
        error={
          errors.password_confirmation
            ? errors.password_confirmation.type === "custom"
              ? t("admin.admins.new.passwordMismatch")
              : t("admin.admins.new.passwordConfirmationRequired")
            : undefined
        }
        register={register("password_confirmation")}
      />

      <div>
        <Label htmlFor="role_id">{t("admin.admins.new.roleLabel")}</Label>
        <Controller
          name="role_id"
          control={control}
          render={({ field }) => (
            <Select
              id="role_id"
              options={roleOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t("admin.admins.new.rolePlaceholder")}
            />
          )}
        />
        {errors.role_id && (
          <FieldError>{t("admin.admins.new.roleRequired")}</FieldError>
        )}
      </div>

      <FormField
        id="change_reason"
        type="text"
        label={t("admin.admins.new.changeReasonLabel")}
        error={
          errors.change_reason
            ? t("admin.admins.new.changeReasonRequired")
            : undefined
        }
        register={register("change_reason")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.admins.new.submitting")
          : t("admin.admins.new.submit")}
      </Button>
    </form>
  );
}
