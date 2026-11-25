export interface AuditEventRecord {
  id: number;
  event_type: string;
  // ISO 8601 (AuditEvent#created_at.iso8601), parseado com `new Date(...)`.
  happened_at: string;
  admin_email: string | null;
  performed_by_admin_email: string | null;
  // Opcionais: só a tela de auditoria completa expõe isso hoje (o feed
  // resumido do dashboard não mostra papel nem IP).
  performed_by_admin_role_name?: string | null;
  // Só preenchido pelo backend quando não há performed_by_admin — fallback
  // pra identificar quem tentou agir mesmo sem um Admin resolvido (ex.
  // login_failed com e-mail inexistente).
  ip_address?: string | null;
  // Só login_failed usa isso hoje (email_address digitado quando a conta
  // não existe) — repassado como veio do backend, sem shape fixo.
  metadata: Record<string, unknown>;
}
