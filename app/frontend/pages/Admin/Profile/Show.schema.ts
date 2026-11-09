import { z } from "zod";

// Limites espelham a validação do servidor (has_secure_password, 72 bytes
// pro bcrypt) — o servidor continua sendo a autoridade final (docs/adr/0010).
export const profileShowSchema = z
  .object({
    current_password: z.string().min(1),
    password: z.string().min(1).max(72),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "mismatch",
  });

export type ProfileShowFormValues = z.infer<typeof profileShowSchema>;
