class AuditEvent < ApplicationRecord
  belongs_to :admin, optional: true

  enum :event_type, {
    login_succeeded: 0,
    login_failed: 1,
    account_locked: 2,
    account_unlocked: 3,
    logout: 4,
    two_factor_enabled: 5,
    two_factor_disabled: 6,
    two_factor_verified: 7,
    two_factor_failed: 8,
    recovery_code_used: 9,
    password_reset_requested: 10,
    password_reset_completed: 11,
    # Senha correta é uma etapa, não o login completo quando 2FA está ativo
    # (login_succeeded fica reservado pro momento em que uma AdminSession
    # de verdade é criada) — separado de propósito pra não misturar "senha
    # bateu" com "logou de fato" no audit log.
    password_verified: 12,
    # Reautenticação (senha de novo) pra confirmar uma ação sensível já
    # autenticada (ex. desativar 2FA) — distinto de login_failed, que é
    # especificamente sobre a tela de login.
    reauthentication_failed: 13,
    # Troca de senha autenticada (tela de perfil, senha atual + nova) —
    # distinto de password_reset_completed (fluxo por token/e-mail, admin
    # nem precisa estar logado), nunca reaproveitado entre os dois.
    password_changed: 14
  }

  validates :event_type, presence: true
end
