import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import useSessionNewForm from "../useSessionNewForm";

export default function SessionNewForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } = useSessionNewForm();

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
          {t("admin.session.new.emailLabel")}
        </Label>
        <Input
          id="email_address"
          type="email"
          autoComplete="email"
          invalid={!!errors.email_address}
          {...register("email_address")}
        />
        {errors.email_address && (
          <FieldError>{t("admin.session.new.emailRequired")}</FieldError>
        )}
      </div>

      <div>
        <Label htmlFor="password">{t("admin.session.new.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <FieldError>{t("admin.session.new.passwordRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.session.new.submitting")
          : t("admin.session.new.submit")}
      </Button>
    </form>
  );
}
