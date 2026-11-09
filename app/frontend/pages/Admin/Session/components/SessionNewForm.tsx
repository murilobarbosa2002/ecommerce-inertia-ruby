import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

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
      <FormField
        id="email_address"
        type="email"
        autoComplete="email"
        label={t("admin.session.new.emailLabel")}
        error={
          errors.email_address
            ? t("admin.session.new.emailRequired")
            : undefined
        }
        register={register("email_address")}
      />

      <FormField
        id="password"
        type="password"
        autoComplete="current-password"
        label={t("admin.session.new.passwordLabel")}
        error={
          errors.password ? t("admin.session.new.passwordRequired") : undefined
        }
        register={register("password")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.session.new.submitting")
          : t("admin.session.new.submit")}
      </Button>
    </form>
  );
}
