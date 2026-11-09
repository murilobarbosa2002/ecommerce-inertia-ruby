import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

import useDisableTwoFactorForm from "../useDisableTwoFactorForm";

export default function DisableTwoFactorForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } =
    useDisableTwoFactorForm();

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="flex items-end gap-3"
      noValidate
    >
      <div className="flex-1">
        <FormField
          id="disable_two_factor_password"
          type="password"
          autoComplete="current-password"
          label={t("admin.profile.disableTwoFactorPasswordLabel")}
          error={
            errors.password
              ? t("admin.profile.disableTwoFactorPasswordRequired")
              : undefined
          }
          register={register("password")}
        />
      </div>

      <Button type="submit" intent="ghost" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.profile.disableTwoFactorSubmitting")
          : t("admin.profile.disableTwoFactorSubmit")}
      </Button>
    </form>
  );
}
