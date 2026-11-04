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
    password_reset_completed: 11
  }

  validates :event_type, presence: true
end
