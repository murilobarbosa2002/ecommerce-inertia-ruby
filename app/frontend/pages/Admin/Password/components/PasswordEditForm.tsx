import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import usePasswordEditForm from "../usePasswordEditForm";

export default function PasswordEditForm({ token }: { token: string }) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } =
    usePasswordEditForm(token);

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="space-y-5"
      noValidate
    >
      <div>
        <Label htmlFor="password">
          {t("admin.password.edit.passwordLabel")}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <FieldError>{t("admin.password.edit.passwordRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="password_confirmation">
          {t("admin.password.edit.passwordConfirmationLabel")}
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
              ? t("admin.password.edit.passwordMismatch")
              : t("admin.password.edit.passwordConfirmationRequired")}
          </FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.password.edit.submitting")
          : t("admin.password.edit.submit")}
      </Button>
    </form>
  );
}
