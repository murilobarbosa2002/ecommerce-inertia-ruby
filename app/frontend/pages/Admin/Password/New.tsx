import { Head, router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import AuthLayout from "@/components/admin/AuthLayout";
import { button, fieldError, input, label, link } from "@/components/admin/ui";
import { admin_passwords_path, new_admin_session_path } from "@/routes";

const passwordRequestSchema = z.object({
  email_address: z.string().min(1).max(254),
});

type PasswordRequestFormValues = z.infer<typeof passwordRequestSchema>;

export default function PasswordNew() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordRequestFormValues>({
    resolver: zodResolver(passwordRequestSchema),
  });

  const onSubmit = (data: PasswordRequestFormValues) => {
    router.post(admin_passwords_path(), data);
  };

  return (
    <AuthLayout title={t("admin.password.new.title")}>
      <Head title={t("admin.password.new.title")} />

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
        noValidate
      >
        <div>
          <label htmlFor="email_address" className={label()}>
            {t("admin.password.new.emailLabel")}
          </label>
          <input
            id="email_address"
            type="email"
            autoComplete="email"
            className={input({ invalid: !!errors.email_address })}
            {...register("email_address")}
          />
          {errors.email_address && (
            <p className={fieldError()}>
              {t("admin.password.new.emailRequired")}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={button()}>
          {isSubmitting
            ? t("admin.password.new.submitting")
            : t("admin.password.new.submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <a href={new_admin_session_path()} className={link()}>
          {t("admin.password.new.backToLogin")}
        </a>
      </p>
    </AuthLayout>
  );
}
