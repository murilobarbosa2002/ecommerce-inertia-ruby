module AdminAuthentication
  class AuthenticateWithPassword
    LOCKOUT_DURATION = 15.minutes

    def self.call(...)
      new(...).call
    end

    def initialize(email_address:, password:, request: nil)
      @email_address = email_address.to_s.strip.downcase
      @password = password
      @request = request
    end

    def call
      admin = Admin.find_by(email_address: @email_address)
      return record_unknown_email_failure unless admin

      return record_locked_failure(admin) if locked?(admin)

      # A janela de 15min já expirou, mas o contador nunca foi zerado (o
      # bloqueio só é checado em tempo de autenticação, não há job
      # limpando isso). Sem isso, a próxima senha errada já re-bloquearia
      # a conta na hora, em vez de recomeçar com um contador zerado.
      clear_expired_lock(admin) if admin.locked_at.present?

      admin.authenticate(@password) ? record_success(admin) : record_wrong_password_failure(admin)
    end

    private

    def locked?(admin)
      admin.locked_at.present? && admin.locked_at > LOCKOUT_DURATION.ago
    end

    def clear_expired_lock(admin)
      AdminAuthentication::ResetFailedLoginAttempts.call(admin: admin)
      AuditEvents::RecordAuditEvent.call(event_type: :account_unlocked, admin: admin, request: @request)
    end

    def record_success(admin)
      AdminAuthentication::ResetFailedLoginAttempts.call(admin: admin)
      AuditEvents::RecordAuditEvent.call(event_type: :login_succeeded, admin: admin, request: @request)
      admin
    end

    def record_wrong_password_failure(admin)
      AdminAuthentication::RecordFailedLoginAttempt.call(admin: admin, request: @request)
      nil
    end

    def record_locked_failure(admin)
      AuditEvents::RecordAuditEvent.call(
        event_type: :login_failed, admin: admin, request: @request, metadata: { reason: "locked" }
      )
      nil
    end

    def record_unknown_email_failure
      AuditEvents::RecordAuditEvent.call(
        event_type: :login_failed, request: @request, metadata: { email_address: @email_address }
      )
      nil
    end
  end
end
