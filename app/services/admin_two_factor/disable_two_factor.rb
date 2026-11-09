module AdminTwoFactor
  class DisableTwoFactor
    def self.call(...)
      new(...).call
    end

    def initialize(admin:, request: nil, event_type: :two_factor_disabled)
      @admin = admin
      @request = request
      @event_type = event_type
    end

    def call
      @admin.admin_recovery_codes.destroy_all
      @admin.update!(otp_required_for_login: false, otp_secret: nil, last_otp_at: nil)
      AuditEvents::RecordAuditEvent.call(event_type: @event_type, admin: @admin, request: @request)
    end
  end
end
