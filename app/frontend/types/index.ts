export interface FlashData {
  notice?: string;
  alert?: string;
}

// `flash` não é um prop compartilhado — fica em `page.flash`, lido via
// `usePage().flash`, não `usePage().props.flash`.
//
// `current_admin_permissions` vem de `inertia_share` em
// `AdminPanel::BaseController` (docs/adr/0021) — array vazio nas páginas
// pré-autenticação (login, reset de senha), nunca usado lá.
export interface SharedProps {
  current_admin_permissions: string[];
  // PageProps do @inertiajs/core exige index signature de string — sem
  // isso, "SharedProps does not satisfy the constraint PageProps".
  [key: string]: unknown;
}
