import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";

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
      <FormField
        id="email_address"
        type="email"
        autoComplete="email"
        label={t("admin.password.new.emailLabel")}
        error={
          errors.email_address
            ? t("admin.password.new.emailRequired")
            : undefined
        }
        register={register("email_address")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.password.new.submitting")
          : t("admin.password.new.submit")}
      </Button>
    </form>
  );
}
