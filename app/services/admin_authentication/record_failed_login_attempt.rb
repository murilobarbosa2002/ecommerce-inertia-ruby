module AdminAuthentication
  class RecordFailedLoginAttempt
    MAX_ATTEMPTS = 5

    def self.call(...)
      new(...).call
    end

    def initialize(admin:, request: nil)
      @admin = admin
      @request = request
    end

    def call
      @admin.increment!(:failed_login_attempts)

      if @admin.failed_login_attempts >= MAX_ATTEMPTS
        @admin.update!(locked_at: Time.current)
        AuditEvents::RecordAuditEvent.call(event_type: :account_locked, admin: @admin, request: @request)
      else
        AuditEvents::RecordAuditEvent.call(event_type: :login_failed, admin: @admin, request: @request)
      end
    end
  end
end
