import { z } from "zod";

export const passwordResetSchema = z
  .object({
    password: z.string().min(1).max(72),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "mismatch",
  });

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
