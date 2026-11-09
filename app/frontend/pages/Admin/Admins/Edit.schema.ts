import { z } from "zod";

export const adminsEditSchema = z.object({
  email_address: z.string().min(1).max(254),
  role_id: z.string().min(1),
  change_reason: z.string().min(1).max(500),
});

export type AdminsEditFormValues = z.infer<typeof adminsEditSchema>;
