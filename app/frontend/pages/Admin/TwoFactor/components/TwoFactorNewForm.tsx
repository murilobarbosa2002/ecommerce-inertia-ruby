import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

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
      <div>
        <Label htmlFor="otp_code">{t("admin.twoFactor.new.codeLabel")}</Label>
        <Input
          id="otp_code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          invalid={!!errors.otp_code}
          {...register("otp_code")}
        />
        {errors.otp_code && (
          <FieldError>{t("admin.twoFactor.new.codeRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.twoFactor.new.submitting")
          : t("admin.twoFactor.new.submit")}
      </Button>
    </form>
  );
}
