import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import FormField from "@/components/shared/form-field/FormField";
import Label from "@/components/shared/label/Label";

import { type RolesNewProps } from "../New.types";
import useRolesNewForm from "../useRolesNewForm";

export default function RolesNewForm({ permissions }: RolesNewProps) {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit, control } =
    useRolesNewForm();

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
        label={t("admin.roles.new.nameLabel")}
        error={errors.name ? t("admin.roles.new.nameRequired") : undefined}
        register={register("name")}
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700 select-none dark:text-gray-300">
          {t("admin.roles.new.permissionsLabel")}
        </legend>
        <Controller
          name="permission_ids"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`permission-${String(permission.id)}`}
                    checked={field.value.includes(permission.id)}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked === true
                          ? [...field.value, permission.id]
                          : field.value.filter((id) => id !== permission.id),
                      );
                    }}
                  />
                  <Label
                    htmlFor={`permission-${String(permission.id)}`}
                    className="mb-0"
                  >
                    {permission.description}
                  </Label>
                </div>
              ))}
            </div>
          )}
        />
      </fieldset>

      <FormField
        id="change_reason"
        type="text"
        label={t("admin.roles.new.changeReasonLabel")}
        error={
          errors.change_reason
            ? t("admin.roles.new.changeReasonRequired")
            : undefined
        }
        register={register("change_reason")}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.roles.new.submitting")
          : t("admin.roles.new.submit")}
      </Button>
    </form>
  );
}
