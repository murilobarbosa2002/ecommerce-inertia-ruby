import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

import useTwoFactorAuthenticationNewForm from "../useTwoFactorAuthenticationNewForm";

export default function TwoFactorAuthenticationNewForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } =
    useTwoFactorAuthenticationNewForm();

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="space-y-5"
      noValidate
    >
      <FormField
        id="otp_code"
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        label={t("admin.twoFactorAuthentication.new.codeLabel")}
        error={
          errors.otp_code
            ? t("admin.twoFactorAuthentication.new.codeRequired")
            : undefined
        }
        register={register("otp_code")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.twoFactorAuthentication.new.submitting")
          : t("admin.twoFactorAuthentication.new.submit")}
      </Button>
    </form>
  );
}
