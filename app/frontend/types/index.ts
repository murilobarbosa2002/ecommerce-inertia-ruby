export interface FlashData {
  notice?: string;
  alert?: string;
}

// `flash` NÃO é um prop compartilhado (`inertia_share`) — é um campo próprio
// do objeto de página do Inertia (`page.flash`, lido via `usePage().flash`),
// paralelo a `props`, não aninhado dentro dele. Bug real encontrado testando
// no browser: `usePage().props.flash` sempre retornava `undefined`, mesmo
// com o redirect enviando `alert:`/`notice:` — o valor real estava em
// `usePage().flash`. SharedProps fica vazio até existir um prop de verdade
// compartilhado via `inertia_share` (ex. admin autenticado).
export type SharedProps = Record<string, never>;
