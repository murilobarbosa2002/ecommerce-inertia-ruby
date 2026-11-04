module AdminAuthentication
  class VerifyTwoFactorCode
    # Tolerância de 15s (metade da janela de 30s do TOTP) pra aceitar um
    # código digitado logo depois de expirar, sem abrir uma janela longa
    # demais pra força bruta.
    DRIFT_BEHIND = 15

    def self.call(...)
      new(...).call
    end

    def initialize(admin:, code:)
      @admin = admin
      @code = code.to_s.strip
    end

    # Retorna :totp, :recovery_code ou nil — quem chama decide qual audit
    # event registrar e como reagir, este serviço só verifica.
    def call
      verify_totp || verify_recovery_code
    end

    private

    def verify_totp
      return nil if @admin.otp_secret.blank? || @code.blank?

      totp = ROTP::TOTP.new(@admin.otp_secret)
      # after: + último timestamp aceito impede reusar o mesmo código dentro
      # da mesma janela de 30s (replay) — ver ROTP::TOTP#verify.
      verified_at = totp.verify(@code, after: @admin.last_otp_at&.to_i, drift_behind: DRIFT_BEHIND)
      return nil unless verified_at

      @admin.update!(last_otp_at: Time.at(verified_at))
      :totp
    end

    def verify_recovery_code
      return nil if @code.blank?

      digest = Digest::SHA256.hexdigest(@code)
      recovery_code = @admin.admin_recovery_codes.unused.find_by(code_digest: digest)
      return nil unless recovery_code

      recovery_code.update!(used_at: Time.current)
      :recovery_code
    end
  end
end
