import {
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Store,
  Unlock,
  UserX,
  type LucideIcon,
} from "lucide-react";

// Mesma ordem do enum AuditEvent#event_type (app/models/audit_event.rb) —
// os 18 tipos reais que existem hoje. Reusado pelo ActivityFeed (dashboard,
// que só mostra um subconjunto curado) e pela tela de auditoria completa,
// pra não duplicar ícone/tom/tradução em dois lugares.
export const AUDIT_EVENT_TYPES = [
  "login_succeeded",
  "login_failed",
  "account_locked",
  "account_unlocked",
  "logout",
  "two_factor_enabled",
  "two_factor_disabled",
  "two_factor_verified",
  "two_factor_failed",
  "recovery_code_used",
  "password_reset_requested",
  "password_reset_completed",
  "password_verified",
  "reauthentication_failed",
  "password_changed",
  "two_factor_reset_by_admin",
  "store_settings_updated",
  "admin_deleted",
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export const AUDIT_EVENT_ICONS: Record<AuditEventType, LucideIcon> = {
  login_succeeded: LogIn,
  login_failed: ShieldAlert,
  account_locked: Lock,
  account_unlocked: Unlock,
  logout: LogOut,
  two_factor_enabled: ShieldCheck,
  two_factor_disabled: ShieldOff,
  two_factor_verified: ShieldCheck,
  two_factor_failed: ShieldAlert,
  recovery_code_used: KeyRound,
  password_reset_requested: Mail,
  password_reset_completed: KeyRound,
  password_verified: CheckCircle2,
  reauthentication_failed: ShieldAlert,
  password_changed: KeyRound,
  two_factor_reset_by_admin: ShieldCheck,
  store_settings_updated: Store,
  admin_deleted: UserX,
};

export const AUDIT_EVENT_TONES: Record<AuditEventType, string> = {
  login_succeeded: "bg-success-soft text-success-text",
  login_failed: "bg-danger-soft text-danger-text",
  account_locked: "bg-danger-soft text-danger-text",
  account_unlocked: "bg-success-soft text-success-text",
  logout: "bg-surface-muted text-fg-muted",
  two_factor_enabled: "bg-success-soft text-success-text",
  two_factor_disabled: "bg-warning-soft text-warning-text",
  two_factor_verified: "bg-success-soft text-success-text",
  two_factor_failed: "bg-danger-soft text-danger-text",
  recovery_code_used: "bg-warning-soft text-warning-text",
  password_reset_requested: "bg-info-soft text-info-text",
  password_reset_completed: "bg-success-soft text-success-text",
  password_verified: "bg-info-soft text-info-text",
  reauthentication_failed: "bg-danger-soft text-danger-text",
  password_changed: "bg-success-soft text-success-text",
  two_factor_reset_by_admin: "bg-warning-soft text-warning-text",
  store_settings_updated: "bg-info-soft text-info-text",
  admin_deleted: "bg-danger-soft text-danger-text",
};

export function isAuditEventType(value: string): value is AuditEventType {
  return (AUDIT_EVENT_TYPES as readonly string[]).includes(value);
}

const DEFAULT_ICON = ShieldAlert;
const DEFAULT_TONE = "bg-surface-muted text-fg-muted";

// event_type vem do backend como string solta (não AuditEventType) — as
// duas funções abaixo lidam com qualquer valor, caindo num ícone/tom
// neutro se for um tipo desconhecido, em vez de indexar o Record direto
// (que o TypeScript não aceita sem o type guard isAuditEventType acima).
export function getAuditEventIcon(eventType: string): LucideIcon {
  return isAuditEventType(eventType)
    ? AUDIT_EVENT_ICONS[eventType]
    : DEFAULT_ICON;
}

export function getAuditEventTone(eventType: string): string {
  return isAuditEventType(eventType)
    ? AUDIT_EVENT_TONES[eventType]
    : DEFAULT_TONE;
}

export type AuditEventBadgeTone =
  "neutral" | "success" | "warning" | "danger" | "info";

// Deriva o tone do Badge (components/shared/badge/) a partir da mesma
// classe Tailwind já usada no círculo do ícone (AUDIT_EVENT_TONES) — evita
// um terceiro mapa com os mesmos 17 tipos só pra outra representação da
// mesma informação (qual "cor semântica" o evento tem).
export function getAuditEventBadgeTone(eventType: string): AuditEventBadgeTone {
  const rawTone = getAuditEventTone(eventType);

  if (rawTone.includes("success")) return "success";
  if (rawTone.includes("warning")) return "warning";
  if (rawTone.includes("danger")) return "danger";
  if (rawTone.includes("info")) return "info";
  return "neutral";
}
