export interface FlashData {
  notice?: string;
  alert?: string;
}

// `flash` não é um prop compartilhado — fica em `page.flash`, lido via
// `usePage().flash`, não `usePage().props.flash`.
//
// `current_admin_permissions`/`current_admin_two_factor_enabled`/
// `current_admin_id` vêm de `inertia_share` em `AdminPanel::BaseController`
// (docs/adr/0021, docs/adr/0023) — valores vazios/false/null nas páginas
// pré-autenticação (login, reset de senha), nunca usados lá.
export interface SharedProps {
  current_admin_permissions: string[];
  current_admin_two_factor_enabled: boolean;
  current_admin_id: number | null;
  // PageProps do @inertiajs/core exige index signature de string — sem
  // isso, "SharedProps does not satisfy the constraint PageProps".
  [key: string]: unknown;
}
