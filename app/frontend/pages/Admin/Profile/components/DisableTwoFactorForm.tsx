import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

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
        <Label htmlFor="disable_two_factor_password">
          {t("admin.profile.disableTwoFactorPasswordLabel")}
        </Label>
        <Input
          id="disable_two_factor_password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <FieldError>
            {t("admin.profile.disableTwoFactorPasswordRequired")}
          </FieldError>
        )}
      </div>

      <Button type="submit" intent="ghost" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.profile.disableTwoFactorSubmitting")
          : t("admin.profile.disableTwoFactorSubmit")}
      </Button>
    </form>
  );
}
