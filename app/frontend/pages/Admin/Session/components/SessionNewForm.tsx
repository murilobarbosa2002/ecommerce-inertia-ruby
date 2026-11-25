import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import FormField from "@/components/shared/form-field/FormField";

import useSessionNewForm from "../useSessionNewForm";

export default function SessionNewForm() {
  const { t } = useTranslation();
  const { register, control, errors, isSubmitting, onSubmit } =
    useSessionNewForm();

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

      <div>
        <div className="flex items-center gap-2">
          <Controller
            name="remember_me"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember_me"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked === true);
                }}
              />
            )}
          />
          <label
            htmlFor="remember_me"
            className="text-sm text-fg-muted select-none"
          >
            {t("admin.session.new.rememberMeLabel")}
          </label>
        </div>
        <p className="mt-1.5 text-xs text-fg-subtle">
          {t("admin.session.new.rememberMeWarning")}
        </p>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.session.new.submitting")
          : t("admin.session.new.submit")}
      </Button>
    </form>
  );
}
