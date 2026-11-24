import { z } from "zod";

// Celular brasileiro: DDD (2 dígitos) + 9 + 8 dígitos, só dígitos — mesmo
// padrão de app/models/admin.rb (Admin::PHONE_FORMAT).
const PHONE_FORMAT = /^\d{2}9\d{8}$/;

// Limites espelham a validação do servidor (app/models/admin.rb,
// app/models/concerns/change_reason_required.rb) — o servidor continua
// sendo a autoridade final (docs/adr/0010), isto é só UX.
export const adminsNewSchema = z
  .object({
    email_address: z.string().min(1).max(254),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    // Opcional: string vazia passa, mas um valor preenchido precisa bater
    // com o formato esperado.
    phone: z.string().regex(PHONE_FORMAT).or(z.literal("")),
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
