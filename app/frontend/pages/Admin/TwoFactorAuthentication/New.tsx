import { Head, router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import AuthLayout from "@/components/admin/AuthLayout";
import { button, fieldError, input, label } from "@/components/admin/ui";

// otp_code aceita tanto um código TOTP de 6 dígitos quanto um código de
// recuperação de 10 caracteres (SecureRandom.alphanumeric(10)) — por isso só
// presença é validada aqui, sem limite de tamanho fixo. O servidor
// (AdminAuthentication::VerifyTwoFactorCode) é quem decide o formato válido.
const twoFactorSchema = z.object({
  otp_code: z.string().min(1),
});

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

export default function TwoFactorAuthenticationNew() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = (data: TwoFactorFormValues) => {
    router.post("/admin/two-factor", data);
  };

  return (
    <AuthLayout
      title={t("admin.twoFactorAuthentication.new.title")}
      description={t("admin.twoFactorAuthentication.new.description")}
    >
      <Head title={t("admin.twoFactorAuthentication.new.title")} />

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
        noValidate
      >
        <div>
          <label htmlFor="otp_code" className={label()}>
            {t("admin.twoFactorAuthentication.new.codeLabel")}
          </label>
          <input
            id="otp_code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            className={input({ invalid: !!errors.otp_code })}
            {...register("otp_code")}
          />
          {errors.otp_code && (
            <p className={fieldError()}>
              {t("admin.twoFactorAuthentication.new.codeRequired")}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={button()}>
          {isSubmitting
            ? t("admin.twoFactorAuthentication.new.submitting")
            : t("admin.twoFactorAuthentication.new.submit")}
        </button>
      </form>
    </AuthLayout>
  );
}
