import { z } from "zod";

export const rolesNewSchema = z.object({
  name: z.string().min(1).max(100),
  permission_ids: z.array(z.number()),
  change_reason: z.string().min(1).max(500),
});

export type RolesNewFormValues = z.infer<typeof rolesNewSchema>;
