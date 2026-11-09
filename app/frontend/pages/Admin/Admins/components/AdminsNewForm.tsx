import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";
import PasswordGenerator from "@/components/shared/password-generator/PasswordGenerator";
import Select from "@/components/shared/select/Select";

import useAdminsNewForm from "../useAdminsNewForm";

export default function AdminsNewForm({
  roles,
}: {
  roles: { id: number; name: string }[];
}) {
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
      <div>
        <Label htmlFor="email_address">
          {t("admin.admins.new.emailLabel")}
        </Label>
        <Input
          id="email_address"
          type="email"
          autoComplete="email"
          invalid={!!errors.email_address}
          {...register("email_address")}
        />
        {errors.email_address && (
          <FieldError>{t("admin.admins.new.emailRequired")}</FieldError>
        )}
      </div>

      <PasswordGenerator
        onGenerate={(password) => {
          setValue("password", password, { shouldValidate: true });
          setValue("password_confirmation", password, {
            shouldValidate: true,
          });
        }}
      />

      <div>
        <Label htmlFor="password">{t("admin.admins.new.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <FieldError>{t("admin.admins.new.passwordRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="password_confirmation">
          {t("admin.admins.new.passwordConfirmationLabel")}
        </Label>
        <Input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password_confirmation}
          {...register("password_confirmation")}
        />
        {errors.password_confirmation && (
          <FieldError>
            {errors.password_confirmation.type === "custom"
              ? t("admin.admins.new.passwordMismatch")
              : t("admin.admins.new.passwordConfirmationRequired")}
          </FieldError>
        )}
      </div>

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

      <div>
        <Label htmlFor="change_reason">
          {t("admin.admins.new.changeReasonLabel")}
        </Label>
        <Input
          id="change_reason"
          type="text"
          invalid={!!errors.change_reason}
          {...register("change_reason")}
        />
        {errors.change_reason && (
          <FieldError>{t("admin.admins.new.changeReasonRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.admins.new.submitting")
          : t("admin.admins.new.submit")}
      </Button>
    </form>
  );
}
