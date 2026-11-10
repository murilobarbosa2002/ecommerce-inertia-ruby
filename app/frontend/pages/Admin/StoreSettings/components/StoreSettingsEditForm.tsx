import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FormField from "@/components/shared/form-field/FormField";
import Label from "@/components/shared/label/Label";

import { type StoreSettingsEditProps } from "../Edit.types";
import useStoreSettingsEditForm from "../useStoreSettingsEditForm";

export default function StoreSettingsEditForm({
  name,
  logo_url,
}: StoreSettingsEditProps) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit } = useStoreSettingsEditForm(
    { name, logo_url },
  );

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="space-y-5"
      noValidate
    >
      <FormField
        id="name"
        type="text"
        label={t("admin.storeSettings.edit.nameLabel")}
        error={
          errors.name ? t("admin.storeSettings.edit.nameTooLong") : undefined
        }
        register={register("name")}
      />

      <div>
        <Label htmlFor="logo">{t("admin.storeSettings.edit.logoLabel")}</Label>
        {logo_url && (
          <img
            src={logo_url}
            alt={t("admin.storeSettings.edit.currentLogoAlt")}
            className="mb-2 size-16 rounded-sm border border-gray-200 object-contain dark:border-gray-800"
          />
        )}
        <input
          id="logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="block w-full text-sm text-gray-700 dark:text-gray-300"
          {...register("logo")}
        />
      </div>

      <FormField
        id="change_reason"
        type="text"
        label={t("admin.storeSettings.edit.changeReasonLabel")}
        error={
          errors.change_reason
            ? t("admin.storeSettings.edit.changeReasonRequired")
            : undefined
        }
        register={register("change_reason")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.storeSettings.edit.submitting")
          : t("admin.storeSettings.edit.submit")}
      </Button>
    </form>
  );
}
