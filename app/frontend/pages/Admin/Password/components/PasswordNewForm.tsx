import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import usePasswordNewForm from "../usePasswordNewForm";

export default function PasswordNewForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } = usePasswordNewForm();

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
          {t("admin.password.new.emailLabel")}
        </Label>
        <Input
          id="email_address"
          type="email"
          autoComplete="email"
          invalid={!!errors.email_address}
          {...register("email_address")}
        />
        {errors.email_address && (
          <FieldError>{t("admin.password.new.emailRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.password.new.submitting")
          : t("admin.password.new.submit")}
      </Button>
    </form>
  );
}
