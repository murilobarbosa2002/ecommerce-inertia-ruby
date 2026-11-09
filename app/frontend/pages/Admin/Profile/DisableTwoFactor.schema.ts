import { z } from "zod";

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1),
});

export type DisableTwoFactorFormValues = z.infer<typeof disableTwoFactorSchema>;
