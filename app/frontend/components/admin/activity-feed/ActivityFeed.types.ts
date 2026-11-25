import { type AuditEventRecord } from "@/lib/audit-events/auditEvent.types";

export type ActivityEvent = AuditEventRecord;

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
