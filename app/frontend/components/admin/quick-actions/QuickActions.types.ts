export interface QuickActionsProps {
  permissions: string[];
  // Chaves salvas em Admin#quick_action_keys ([] = "nunca configurou",
  // interpretado como "mostra todas as permitidas").
  quickActionKeys: string[];
  className?: string;
}
