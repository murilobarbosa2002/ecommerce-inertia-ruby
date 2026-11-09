import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

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
      <FormField
        id="current_password"
        type="password"
        autoComplete="current-password"
        label={t("admin.profile.currentPasswordLabel")}
        error={
          errors.current_password
            ? t("admin.profile.currentPasswordRequired")
            : undefined
        }
        register={register("current_password")}
      />

      <FormField
        id="password"
        type="password"
        autoComplete="new-password"
        label={t("admin.profile.passwordLabel")}
        error={
          errors.password ? t("admin.profile.passwordRequired") : undefined
        }
        register={register("password")}
      />

      <FormField
        id="password_confirmation"
        type="password"
        autoComplete="new-password"
        label={t("admin.profile.passwordConfirmationLabel")}
        error={
          errors.password_confirmation
            ? errors.password_confirmation.type === "custom"
              ? t("admin.profile.passwordMismatch")
              : t("admin.profile.passwordConfirmationRequired")
            : undefined
        }
        register={register("password_confirmation")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.profile.submitting")
          : t("admin.profile.submit")}
      </Button>
    </form>
  );
}
