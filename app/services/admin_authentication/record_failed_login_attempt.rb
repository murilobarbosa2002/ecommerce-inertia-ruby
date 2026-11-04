module AdminAuthentication
  class RecordFailedLoginAttempt
    MAX_ATTEMPTS = 5

    def self.call(...)
      new(...).call
    end

    # event_type: o que registrar quando ainda não atingiu o limite (varia
    # conforme qual fator falhou — senha ou código 2FA); ao atingir o limite,
    # sempre é account_locked independente de qual fator causou o bloqueio.
    def initialize(admin:, request: nil, event_type: :login_failed)
      @admin = admin
      @request = request
      @event_type = event_type
    end

    def call
      @admin.increment!(:failed_login_attempts)

      if @admin.failed_login_attempts >= MAX_ATTEMPTS
        @admin.update!(locked_at: Time.current)
        AuditEvents::RecordAuditEvent.call(event_type: :account_locked, admin: @admin, request: @request)
      else
        AuditEvents::RecordAuditEvent.call(event_type: @event_type, admin: @admin, request: @request)
      end
    end
  end
end
