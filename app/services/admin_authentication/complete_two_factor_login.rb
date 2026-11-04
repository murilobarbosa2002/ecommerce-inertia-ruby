module AdminAuthentication
  class CompleteTwoFactorLogin
    def self.call(...)
      new(...).call
    end

    def initialize(admin:, code:, request: nil)
      @admin = admin
      @code = code
      @request = request
    end

    # Retorna :totp, :recovery_code ou nil. Checa bloqueio de conta antes de
    # verificar o código — sem isso, uma conta bloqueada por força bruta na
    # senha (ou nas próprias tentativas de 2FA) ainda completaria o login
    # com um código 2FA certo, ignorando o bloqueio inteiro.
    def call
      return nil if locked?

      result = AdminAuthentication::VerifyTwoFactorCode.call(admin: @admin, code: @code)

      if result
        result
      else
        AdminAuthentication::RecordFailedLoginAttempt.call(
          admin: @admin, request: @request, event_type: :two_factor_failed
        )
        nil
      end
    end

    private

    def locked?
      @admin.locked_at.present? && @admin.locked_at > AdminAuthentication::AuthenticateWithPassword::LOCKOUT_DURATION.ago
    end
  end
end
