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
  // Identidade do admin logado e da loja pro shell do painel (menu do
  // usuário, marca da sidebar) — `current_admin` é null nas páginas
  // pré-autenticação; `store.name` é null enquanto a loja não tem nome.
  current_admin: { email_address: string; role_name: string } | null;
  // Opcional no tipo só porque o PanelLayout também é renderizado fora do
  // contexto compartilhado (ex. testes); o backend sempre envia.
  store?: { name: string | null; logo_url: string | null };
  // PageProps do @inertiajs/core exige index signature de string — sem
  // isso, "SharedProps does not satisfy the constraint PageProps".
  [key: string]: unknown;
}
