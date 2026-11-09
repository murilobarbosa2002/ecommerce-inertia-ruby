import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

import { type PasswordEditProps } from "../Edit.types";
import usePasswordEditForm from "../usePasswordEditForm";

export default function PasswordEditForm({ token }: PasswordEditProps) {
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
      <FormField
        id="password"
        type="password"
        autoComplete="new-password"
        label={t("admin.password.edit.passwordLabel")}
        error={
          errors.password
            ? t("admin.password.edit.passwordRequired")
            : undefined
        }
        register={register("password")}
      />

      <FormField
        id="password_confirmation"
        type="password"
        autoComplete="new-password"
        label={t("admin.password.edit.passwordConfirmationLabel")}
        error={
          errors.password_confirmation
            ? errors.password_confirmation.type === "custom"
              ? t("admin.password.edit.passwordMismatch")
              : t("admin.password.edit.passwordConfirmationRequired")
            : undefined
        }
        register={register("password_confirmation")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.password.edit.submitting")
          : t("admin.password.edit.submit")}
      </Button>
    </form>
  );
}
