import { z } from "zod";

// Limites espelham a validação do servidor (app/models/admin.rb) — o
// servidor continua sendo a autoridade final (docs/adr/0010), isto é só UX.
export const loginSchema = z.object({
  email_address: z.string().min(1).max(254),
  password: z.string().min(1),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
