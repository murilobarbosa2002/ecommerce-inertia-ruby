import { Head, router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import AuthLayout from "@/components/admin/AuthLayout";
import { button, fieldError, input, label } from "@/components/admin/ui";

const passwordResetSchema = z
  .object({
    password: z.string().min(1).max(72),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "mismatch",
  });

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function PasswordEdit({ token }: { token: string }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = (data: PasswordResetFormValues) => {
    router.patch(`/admin/passwords/${token}`, data);
  };

  return (
    <AuthLayout title={t("admin.password.edit.title")}>
      <Head title={t("admin.password.edit.title")} />

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
        noValidate
      >
        <div>
          <label htmlFor="password" className={label()}>
            {t("admin.password.edit.passwordLabel")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={input({ invalid: !!errors.password })}
            {...register("password")}
          />
          {errors.password && (
            <p className={fieldError()}>
              {t("admin.password.edit.passwordRequired")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password_confirmation" className={label()}>
            {t("admin.password.edit.passwordConfirmationLabel")}
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            className={input({ invalid: !!errors.password_confirmation })}
            {...register("password_confirmation")}
          />
          {errors.password_confirmation && (
            <p className={fieldError()}>
              {errors.password_confirmation.type === "custom"
                ? t("admin.password.edit.passwordMismatch")
                : t("admin.password.edit.passwordConfirmationRequired")}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={button()}>
          {isSubmitting
            ? t("admin.password.edit.submitting")
            : t("admin.password.edit.submit")}
        </button>
      </form>
    </AuthLayout>
  );
}
