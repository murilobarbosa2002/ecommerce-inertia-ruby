import { z } from "zod";

// Celular brasileiro: DDD (2 dígitos) + 9 + 8 dígitos, só dígitos — mesmo
// padrão de app/models/admin.rb (Admin::PHONE_FORMAT).
const PHONE_FORMAT = /^\d{2}9\d{8}$/;

export const adminsEditSchema = z.object({
  email_address: z.string().min(1).max(254),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().regex(PHONE_FORMAT).or(z.literal("")),
  role_id: z.string().min(1),
  change_reason: z.string().min(1).max(500),
});

export type AdminsEditFormValues = z.infer<typeof adminsEditSchema>;
