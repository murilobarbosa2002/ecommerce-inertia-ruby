require "rails_helper"

RSpec.describe AdminAuthentication::VerifyTwoFactorCode do
  describe ".call" do
    let(:admin) { create(:admin) }

    before { AdminTwoFactor::GenerateSecret.call(admin: admin) }

    it "aceita um código TOTP válido" do
      code = ROTP::TOTP.new(admin.otp_secret).now

      expect(described_class.call(admin: admin, code: code)).to eq(:totp)
    end

    it "rejeita um código TOTP errado" do
      expect(described_class.call(admin: admin, code: "000000")).to be_nil
    end

    it "não aceita o mesmo código TOTP duas vezes (proteção contra replay)" do
      code = ROTP::TOTP.new(admin.otp_secret).now

      expect(described_class.call(admin: admin, code: code)).to eq(:totp)
      expect(described_class.call(admin: admin, code: code)).to be_nil
    end

    it "aceita um código de recuperação válido" do
      recovery_code = AdminTwoFactor::GenerateRecoveryCodes.call(admin: admin).first

      expect(described_class.call(admin: admin, code: recovery_code)).to eq(:recovery_code)
    end

    it "não aceita o mesmo código de recuperação duas vezes" do
      recovery_code = AdminTwoFactor::GenerateRecoveryCodes.call(admin: admin).first

      expect(described_class.call(admin: admin, code: recovery_code)).to eq(:recovery_code)
      expect(described_class.call(admin: admin, code: recovery_code)).to be_nil
    end

    it "rejeita quando o admin não tem 2FA configurado" do
      admin_sem_2fa = create(:admin)

      expect(described_class.call(admin: admin_sem_2fa, code: "123456")).to be_nil
    end
  end
end
