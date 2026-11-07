import { z } from "zod";

export const passwordRequestSchema = z.object({
  email_address: z.string().min(1).max(254),
});

export type PasswordRequestFormValues = z.infer<typeof passwordRequestSchema>;
