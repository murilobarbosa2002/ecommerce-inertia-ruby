import { type ParseKeys } from "i18next";
import { type LucideIcon } from "lucide-react";

export interface QuickAction {
  // Chave estável salva em Admin#quick_action_keys — nunca renomeada sem
  // migrar o dado já salvo, já que o backend não valida contra este
  // catálogo (ver AdminPanel::QuickActionsController).
  key: string;
  labelKey: ParseKeys;
  icon: LucideIcon;
  href: () => string;
  // Permissão exigida pra a ação aparecer (tanto no dashboard quanto no
  // diálogo de configurar). Sem isso, todo admin vê.
  permission?: string;
}
