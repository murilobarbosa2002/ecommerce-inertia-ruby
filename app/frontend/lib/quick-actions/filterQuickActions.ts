import { type QuickAction } from "./quickActions.types";

// Só as ações que o admin pode ver (sem permissão exigida, ou com ela no
// papel dele) — mesmo racional de filterNavigation
// (lib/navigation/filterNavigation.ts), mas pro catálogo de Quick Actions.
export default function filterQuickActions(
  actions: QuickAction[],
  permissions: string[],
): QuickAction[] {
  return actions.filter(
    (action) => !action.permission || permissions.includes(action.permission),
  );
}
