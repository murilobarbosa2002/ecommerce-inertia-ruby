import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import useProfileShowForm from "../useProfileShowForm";

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } = useProfileShowForm();

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="space-y-5"
      noValidate
    >
      <div>
        <Label htmlFor="current_password">
          {t("admin.profile.currentPasswordLabel")}
        </Label>
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.current_password}
          {...register("current_password")}
        />
        {errors.current_password && (
          <FieldError>{t("admin.profile.currentPasswordRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="password">{t("admin.profile.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <FieldError>{t("admin.profile.passwordRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="password_confirmation">
          {t("admin.profile.passwordConfirmationLabel")}
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
              ? t("admin.profile.passwordMismatch")
              : t("admin.profile.passwordConfirmationRequired")}
          </FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.profile.submitting")
          : t("admin.profile.submit")}
      </Button>
    </form>
  );
}
