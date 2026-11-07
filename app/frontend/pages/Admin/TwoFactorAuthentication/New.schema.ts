import { z } from "zod";

// otp_code aceita tanto um código TOTP de 6 dígitos quanto um código de
// recuperação de 10 caracteres (SecureRandom.alphanumeric(10)) — por isso só
// presença é validada aqui, sem limite de tamanho fixo. O servidor
// (AdminAuthentication::VerifyTwoFactorCode) é quem decide o formato válido.
export const twoFactorSchema = z.object({
  otp_code: z.string().min(1),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;
