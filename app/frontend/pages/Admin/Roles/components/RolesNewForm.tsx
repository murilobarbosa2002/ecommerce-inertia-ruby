import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import useRolesNewForm from "../useRolesNewForm";

interface PermissionOption {
  id: number;
  key: string;
  description: string;
}

export default function RolesNewForm({
  permissions,
}: {
  permissions: PermissionOption[];
}) {
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
      <div>
        <Label htmlFor="name">{t("admin.roles.new.nameLabel")}</Label>
        <Input
          id="name"
          type="text"
          invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <FieldError>{t("admin.roles.new.nameRequired")}</FieldError>
        )}
      </div>

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

      <div>
        <Label htmlFor="change_reason">
          {t("admin.roles.new.changeReasonLabel")}
        </Label>
        <Input
          id="change_reason"
          type="text"
          invalid={!!errors.change_reason}
          {...register("change_reason")}
        />
        {errors.change_reason && (
          <FieldError>{t("admin.roles.new.changeReasonRequired")}</FieldError>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? t("admin.roles.new.submitting")
          : t("admin.roles.new.submit")}
      </Button>
    </form>
  );
}
