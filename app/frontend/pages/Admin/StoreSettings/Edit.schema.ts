import { z } from "zod";

export const storeSettingsEditSchema = z.object({
  name: z.string().max(100),
  // Opcional — campo vazio (nenhum arquivo novo escolhido) não deve
  // quebrar a validação nem apagar o logo já existente (ver
  // useStoreSettingsEditForm, que só envia um arquivo quando há um).
  logo: z.instanceof(FileList).optional(),
  change_reason: z.string().min(1).max(500),
});

export type StoreSettingsEditFormValues = z.infer<
  typeof storeSettingsEditSchema
>;
