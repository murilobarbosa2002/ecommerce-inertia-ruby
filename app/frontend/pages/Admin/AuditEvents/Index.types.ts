import { type AuditEventRecord } from "@/lib/audit-events/auditEvent.types";

export interface AuditActor {
  id: number;
  email_address: string;
}

export interface AuditEventsIndexProps {
  audit_events: {
    records: AuditEventRecord[];
    page: number;
    total_pages: number;
    total_count: number;
  };
  actors: AuditActor[];
}
