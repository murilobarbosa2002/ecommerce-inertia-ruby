import { z } from "zod";

// Limites espelham a validação do servidor (app/models/admin.rb,
// app/models/concerns/change_reason_required.rb) — o servidor continua
// sendo a autoridade final (docs/adr/0010), isto é só UX.
export const adminsNewSchema = z
  .object({
    email_address: z.string().min(1).max(254),
    password: z.string().min(1).max(72),
    password_confirmation: z.string().min(1),
    role_id: z.string().min(1),
    change_reason: z.string().min(1).max(500),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "mismatch",
  });

export type AdminsNewFormValues = z.infer<typeof adminsNewSchema>;
