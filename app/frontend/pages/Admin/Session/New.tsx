import { Head, router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import AuthLayout from "@/components/admin/AuthLayout";
import { button, fieldError, input, label, link } from "@/components/admin/ui";
import { admin_session_path, new_admin_password_path } from "@/routes";

// Limites espelham a validação do servidor (app/models/admin.rb) — o
// servidor continua sendo a autoridade final (docs/adr/0010), isto é só UX.
const loginSchema = z.object({
  email_address: z.string().min(1).max(254),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SessionNew() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    router.post(admin_session_path(), data);
  };

  return (
    <AuthLayout title={t("admin.session.new.title")}>
      <Head title={t("admin.session.new.title")} />

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
        noValidate
      >
        <div>
          <label htmlFor="email_address" className={label()}>
            {t("admin.session.new.emailLabel")}
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
              {t("admin.session.new.emailRequired")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={label()}>
            {t("admin.session.new.passwordLabel")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={input({ invalid: !!errors.password })}
            {...register("password")}
          />
          {errors.password && (
            <p className={fieldError()}>
              {t("admin.session.new.passwordRequired")}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={button()}>
          {isSubmitting
            ? t("admin.session.new.submitting")
            : t("admin.session.new.submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <a href={new_admin_password_path()} className={link()}>
          {t("admin.session.new.forgotPassword")}
        </a>
      </p>
    </AuthLayout>
  );
}
