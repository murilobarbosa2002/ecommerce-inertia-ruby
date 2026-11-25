import { z } from "zod";

// Mesmo valor do backend (StoreSetting::ALLOWED_LOGO_CONTENT_TYPES e
// ::MAX_LOGO_SIZE) — duplicado aqui porque é o único jeito de validar no
// cliente sem carregar JSON do servidor só pra isso; o backend continua
// sendo a autoridade (CONTRIBUTING.md, Segurança).
export const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
export const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export const storeSettingsEditSchema = z.object({
  name: z.string().max(100),
  // Opcional — nenhum arquivo novo escolhido não deve quebrar a validação
  // nem apagar o logo já existente (ver useStoreSettingsEditForm, que só
  // envia um arquivo quando há um). Tipo/tamanho já são bloqueados antes de
  // chegar aqui pelo próprio FileDropzone; não duplicado via .refine().
  logo: z.instanceof(File).optional(),
  change_reason: z.string().min(1).max(500),
});

export type StoreSettingsEditFormValues = z.infer<
  typeof storeSettingsEditSchema
>;
