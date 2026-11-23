export interface ActivityEvent {
  id: number;
  event_type: string;
  // ISO 8601 (AuditEvent#created_at.iso8601), parseado com `new Date(...)`.
  happened_at: string;
  admin_email: string | null;
  performed_by_admin_email: string | null;
  // Só login_failed usa isso hoje (email_address digitado quando a conta
  // não existe) — repassado como veio do backend, sem shape fixo.
  metadata: Record<string, unknown>;
}

export interface ActivityData {
  events: ActivityEvent[];
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface ActivityFeedProps {
  activity: ActivityData;
}
