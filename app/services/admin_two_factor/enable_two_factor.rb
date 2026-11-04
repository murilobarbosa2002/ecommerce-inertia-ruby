module AdminTwoFactor
  class EnableTwoFactor
    def self.call(...)
      new(...).call
    end

    def initialize(admin:, code:, request: nil)
      @admin = admin
      @code = code
      @request = request
    end

    # Retorna os códigos de recuperação (texto puro, uma única vez) em
    # sucesso, nil se o código de confirmação estava errado.
    def call
      return nil unless AdminAuthentication::VerifyTwoFactorCode.call(admin: @admin, code: @code) == :totp

      @admin.update!(otp_required_for_login: true)
      recovery_codes = AdminTwoFactor::GenerateRecoveryCodes.call(admin: @admin)
      AuditEvents::RecordAuditEvent.call(event_type: :two_factor_enabled, admin: @admin, request: @request)
      recovery_codes
    end
  end
end
