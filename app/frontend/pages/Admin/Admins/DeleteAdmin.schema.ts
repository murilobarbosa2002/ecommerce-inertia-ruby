import { z } from "zod";

export const deleteAdminSchema = z.object({
  password: z.string().min(1),
  change_reason: z.string().min(1),
});

export type DeleteAdminFormValues = z.infer<typeof deleteAdminSchema>;
