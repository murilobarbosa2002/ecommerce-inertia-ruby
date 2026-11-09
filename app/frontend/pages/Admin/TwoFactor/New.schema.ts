import { z } from "zod";

export const twoFactorNewSchema = z.object({
  otp_code: z.string().min(1),
});

export type TwoFactorNewFormValues = z.infer<typeof twoFactorNewSchema>;
