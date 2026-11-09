import { z } from "zod";

export const rolesEditSchema = z.object({
  name: z.string().min(1).max(100),
  permission_ids: z.array(z.number()),
  change_reason: z.string().min(1).max(500),
});

export type RolesEditFormValues = z.infer<typeof rolesEditSchema>;
