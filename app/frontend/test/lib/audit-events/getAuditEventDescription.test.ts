import { describe, expect, it } from "vitest";

import i18n from "@/i18n";
import getAuditEventDescription from "@/lib/audit-events/getAuditEventDescription";

const t = i18n.t.bind(i18n);

function event(
  overrides: Partial<Parameters<typeof getAuditEventDescription>[0]>,
) {
  return {
    id: 1,
    event_type: "login_succeeded",
    happened_at: "2026-11-24T10:00:00Z",
    admin_email: "ana@example.com",
    performed_by_admin_email: null,
    metadata: {},
    ...overrides,
  };
}

describe("getAuditEventDescription", () => {
  it.each([
    ["login_succeeded", "ana@example.com fez login"],
    [
      "account_locked",
      "ana@example.com teve a conta bloqueada por tentativas de login inválidas",
    ],
    ["account_unlocked", "ana@example.com teve a conta desbloqueada"],
    ["logout", "ana@example.com saiu"],
    ["two_factor_enabled", "ana@example.com ativou o 2FA"],
    ["two_factor_disabled", "ana@example.com desativou o 2FA"],
    ["two_factor_verified", "ana@example.com verificou o código do 2FA"],
    ["two_factor_failed", "ana@example.com errou o código do 2FA"],
    [
      "recovery_code_used",
      "ana@example.com usou um código de recuperação do 2FA",
    ],
    [
      "password_reset_requested",
      "ana@example.com solicitou redefinição de senha",
    ],
    ["password_reset_completed", "ana@example.com redefiniu a senha"],
    ["password_verified", "ana@example.com confirmou a senha"],
    [
      "reauthentication_failed",
      "ana@example.com errou a senha ao reautenticar",
    ],
    ["password_changed", "ana@example.com trocou a senha"],
  ])("monta a descrição de %s", (eventType, expected) => {
    expect(getAuditEventDescription(event({ event_type: eventType }), t)).toBe(
      expected,
    );
  });

  it("login_failed usa o e-mail da conta quando existe", () => {
    expect(
      getAuditEventDescription(
        event({ event_type: "login_failed", admin_email: "ana@example.com" }),
        t,
      ),
    ).toBe("Tentativa de login falhou para ana@example.com");
  });

  it("login_failed usa o e-mail digitado (metadata) quando não há conta correspondente", () => {
    expect(
      getAuditEventDescription(
        event({
          event_type: "login_failed",
          admin_email: null,
          metadata: { email_address: "nao-existe@example.com" },
        }),
        t,
      ),
    ).toBe("Tentativa de login falhou para nao-existe@example.com");
  });

  it("login_failed mostra quantas tentativas faltam antes do bloqueio, quando a metadata traz isso", () => {
    expect(
      getAuditEventDescription(
        event({
          event_type: "login_failed",
          admin_email: "ana@example.com",
          metadata: { attempt: 3, max_attempts: 5 },
        }),
        t,
      ),
    ).toBe(
      "Tentativa de login falhou para ana@example.com (3ª de 5 antes do bloqueio)",
    );
  });

  it("two_factor_reset_by_admin cita o ator e o sujeito", () => {
    expect(
      getAuditEventDescription(
        event({
          event_type: "two_factor_reset_by_admin",
          admin_email: "ana@example.com",
          performed_by_admin_email: "owner@example.com",
        }),
        t,
      ),
    ).toBe("owner@example.com resetou o 2FA de ana@example.com");
  });

  it("store_settings_updated cita só o ator (evento não é de nenhuma conta específica)", () => {
    expect(
      getAuditEventDescription(
        event({
          event_type: "store_settings_updated",
          admin_email: null,
          performed_by_admin_email: "owner@example.com",
        }),
        t,
      ),
    ).toBe("owner@example.com alterou as configurações da loja");
  });

  it("admin_deleted cita quem excluiu e o e-mail salvo em metadata (admin_email já vem nulo)", () => {
    expect(
      getAuditEventDescription(
        event({
          event_type: "admin_deleted",
          admin_email: null,
          performed_by_admin_email: "owner@example.com",
          metadata: { deleted_admin_email: "ana@example.com" },
        }),
        t,
      ),
    ).toBe("owner@example.com excluiu a conta de ana@example.com");
  });

  it("devolve a chave crua pra um tipo desconhecido", () => {
    expect(
      getAuditEventDescription(event({ event_type: "tipo_que_nao_existe" }), t),
    ).toBe("tipo_que_nao_existe");
  });
});
