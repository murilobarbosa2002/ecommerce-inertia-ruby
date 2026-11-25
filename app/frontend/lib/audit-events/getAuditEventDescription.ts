import { type TFunction } from "i18next";

import { type AuditEventRecord } from "./auditEvent.types";

// i18next só aceita string | number pra interpolação — os campos de e-mail
// do backend vêm string | null (admin/performed_by_admin podem não
// existir, ex. login_failed sem conta correspondente), e metadata é
// Record<string, unknown>, então o fallback precisa de um cast explícito.
function emailOrFallback(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Reusado pelo ActivityFeed (dashboard) e pela tela de auditoria completa —
// cobre os 17 tipos reais de AuditEvent#event_type, não só o subconjunto
// curado que o dashboard mostra.
export default function getAuditEventDescription(
  event: AuditEventRecord,
  t: TFunction,
): string {
  const email = emailOrFallback(event.admin_email);
  const actorEmail = emailOrFallback(event.performed_by_admin_email);

  switch (event.event_type) {
    case "login_succeeded":
      return t("admin.auditEvents.descriptions.loginSucceeded", { email });
    case "login_failed": {
      const failedEmail = emailOrFallback(
        event.admin_email ?? event.metadata.email_address,
      );
      const attempt = event.metadata.attempt;
      const maxAttempts = event.metadata.max_attempts;
      if (typeof attempt === "number" && typeof maxAttempts === "number") {
        return t("admin.auditEvents.descriptions.loginFailedWithAttempts", {
          email: failedEmail,
          attempt,
          maxAttempts,
        });
      }
      return t("admin.auditEvents.descriptions.loginFailed", {
        email: failedEmail,
      });
    }
    case "account_locked":
      return t("admin.auditEvents.descriptions.accountLocked", { email });
    case "account_unlocked":
      return t("admin.auditEvents.descriptions.accountUnlocked", { email });
    case "logout":
      return t("admin.auditEvents.descriptions.logout", { email });
    case "two_factor_enabled":
      return t("admin.auditEvents.descriptions.twoFactorEnabled", { email });
    case "two_factor_disabled":
      return t("admin.auditEvents.descriptions.twoFactorDisabled", { email });
    case "two_factor_verified":
      return t("admin.auditEvents.descriptions.twoFactorVerified", { email });
    case "two_factor_failed":
      return t("admin.auditEvents.descriptions.twoFactorFailed", { email });
    case "recovery_code_used":
      return t("admin.auditEvents.descriptions.recoveryCodeUsed", { email });
    case "password_reset_requested":
      return t("admin.auditEvents.descriptions.passwordResetRequested", {
        email,
      });
    case "password_reset_completed":
      return t("admin.auditEvents.descriptions.passwordResetCompleted", {
        email,
      });
    case "password_verified":
      return t("admin.auditEvents.descriptions.passwordVerified", { email });
    case "reauthentication_failed":
      return t("admin.auditEvents.descriptions.reauthenticationFailed", {
        email,
      });
    case "password_changed":
      return t("admin.auditEvents.descriptions.passwordChanged", { email });
    case "two_factor_reset_by_admin":
      return t("admin.auditEvents.descriptions.twoFactorResetByAdmin", {
        email,
        actorEmail,
      });
    case "store_settings_updated":
      return t("admin.auditEvents.descriptions.storeSettingsUpdated", {
        actorEmail,
      });
    default:
      return event.event_type;
  }
}
