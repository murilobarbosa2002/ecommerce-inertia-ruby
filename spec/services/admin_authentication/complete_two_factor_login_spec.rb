require "rails_helper"

RSpec.describe AdminAuthentication::CompleteTwoFactorLogin do
  describe ".call" do
    let(:admin) { create(:admin) }

    before { AdminTwoFactor::GenerateSecret.call(admin: admin) }

    it "aceita um código TOTP válido" do
      code = ROTP::TOTP.new(admin.otp_secret).now

      expect(described_class.call(admin: admin, code: code)).to eq(:totp)
    end

    it "rejeita código errado e incrementa tentativas" do
      result = described_class.call(admin: admin, code: "000000")

      expect(result).to be_nil
      expect(admin.reload.failed_login_attempts).to eq(1)
    end

    it "registra two_factor_failed enquanto não atinge o limite de tentativas" do
      described_class.call(admin: admin, code: "000000")

      expect(AuditEvent.last.event_type).to eq("two_factor_failed")
    end

    it "bloqueia a conta ao atingir o limite de tentativas de 2FA erradas" do
      4.times { described_class.call(admin: admin, code: "000000") }

      described_class.call(admin: admin, code: "000000")

      expect(admin.reload.locked_at).to be_present
    end

    it "rejeita até um código correto quando a conta está bloqueada" do
      admin.update!(failed_login_attempts: 5, locked_at: Time.current)
      code = ROTP::TOTP.new(admin.otp_secret).now

      result = described_class.call(admin: admin, code: code)

      expect(result).to be_nil
    end

    it "não incrementa tentativas numa conta já bloqueada" do
      admin.update!(failed_login_attempts: 5, locked_at: Time.current)

      described_class.call(admin: admin, code: "000000")

      expect(admin.reload.failed_login_attempts).to eq(5)
    end
  end
end
