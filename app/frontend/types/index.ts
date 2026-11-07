export interface FlashData {
  notice?: string;
  alert?: string;
}

// `flash` não é um prop compartilhado — fica em `page.flash`, lido via
// `usePage().flash`, não `usePage().props.flash`.
export type SharedProps = Record<string, never>;
