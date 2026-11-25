import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import FileDropzone from "@/components/shared/file-dropzone/FileDropzone";
import FormField from "@/components/shared/form-field/FormField";
import Label from "@/components/shared/label/Label";

import { ALLOWED_LOGO_TYPES, MAX_LOGO_SIZE } from "../Edit.schema";
import { type StoreSettingsEditProps } from "../Edit.types";
import useStoreSettingsEditForm from "../useStoreSettingsEditForm";

export default function StoreSettingsEditForm({
  name,
  logo_url,
}: StoreSettingsEditProps) {
  const { t } = useTranslation();
  const { register, control, errors, isSubmitting, onSubmit } =
    useStoreSettingsEditForm({ name, logo_url });

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
        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <FileDropzone
              id="logo"
              value={field.value ?? null}
              onChange={field.onChange}
              accept={ALLOWED_LOGO_TYPES}
              maxSize={MAX_LOGO_SIZE}
              previewUrl={logo_url}
              previewAlt={t("admin.storeSettings.edit.currentLogoAlt")}
              instructions={t("admin.storeSettings.edit.logoInstructions")}
              removeLabel={t("admin.storeSettings.edit.logoCancelSelection")}
              invalidTypeError={t("admin.storeSettings.edit.logoInvalidType")}
              tooLargeError={t("admin.storeSettings.edit.logoTooLarge")}
            />
          )}
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

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.storeSettings.edit.submitting")
          : t("admin.storeSettings.edit.submit")}
      </Button>
    </form>
  );
}
