import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

import useTwoFactorNewForm from "../useTwoFactorNewForm";

export default function TwoFactorNewForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } = useTwoFactorNewForm();

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
        inputMode="numeric"
        autoComplete="one-time-code"
        label={t("admin.twoFactor.new.codeLabel")}
        error={
          errors.otp_code ? t("admin.twoFactor.new.codeRequired") : undefined
        }
        register={register("otp_code")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.twoFactor.new.submitting")
          : t("admin.twoFactor.new.submit")}
      </Button>
    </form>
  );
}
