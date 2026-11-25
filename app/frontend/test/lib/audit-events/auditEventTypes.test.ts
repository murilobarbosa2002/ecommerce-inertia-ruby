import { describe, expect, it } from "vitest";

import {
  AUDIT_EVENT_TYPES,
  getAuditEventBadgeTone,
  getAuditEventIcon,
  getAuditEventTone,
  isAuditEventType,
} from "@/lib/audit-events/auditEventTypes";

describe("isAuditEventType", () => {
  it("reconhece um tipo real", () => {
    expect(isAuditEventType("login_succeeded")).toBe(true);
  });

  it("rejeita um tipo desconhecido", () => {
    expect(isAuditEventType("tipo_que_nao_existe")).toBe(false);
  });
});

describe("getAuditEventIcon/getAuditEventTone", () => {
  it("tem ícone e tom pra todos os 17 tipos reais", () => {
    AUDIT_EVENT_TYPES.forEach((eventType) => {
      expect(getAuditEventIcon(eventType)).toBeDefined();
      expect(getAuditEventTone(eventType)).toMatch(/^bg-/);
    });
  });

  it("cai num ícone/tom neutro pra um tipo desconhecido", () => {
    expect(getAuditEventTone("tipo_que_nao_existe")).toBe(
      "bg-surface-muted text-fg-muted",
    );
  });
});

describe("getAuditEventBadgeTone", () => {
  it.each([
    ["login_succeeded", "success"],
    ["login_failed", "danger"],
    ["two_factor_reset_by_admin", "warning"],
    ["store_settings_updated", "info"],
    ["logout", "neutral"],
  ])("deriva o tone do Badge pra %s", (eventType, expected) => {
    expect(getAuditEventBadgeTone(eventType)).toBe(expected);
  });

  it("cai em neutral pra um tipo desconhecido", () => {
    expect(getAuditEventBadgeTone("tipo_que_nao_existe")).toBe("neutral");
  });
});
