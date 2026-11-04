require "rails_helper"

RSpec.describe AdminTwoFactor::EnableTwoFactor do
  describe ".call" do
    let(:admin) { create(:admin) }

    before { AdminTwoFactor::GenerateSecret.call(admin: admin) }

    it "ativa o 2FA e retorna os códigos de recuperação com código válido" do
      code = ROTP::TOTP.new(admin.otp_secret).now

      result = described_class.call(admin: admin, code: code)

      expect(result).to be_an(Array)
      expect(result.size).to eq(10)
      expect(admin.reload.otp_required_for_login?).to be true
    end

    it "registra two_factor_enabled com código válido" do
      code = ROTP::TOTP.new(admin.otp_secret).now

      expect do
        described_class.call(admin: admin, code: code)
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("two_factor_enabled")
      expect(AuditEvent.last.admin).to eq(admin)
    end

    it "não ativa o 2FA com código inválido" do
      result = described_class.call(admin: admin, code: "000000")

      expect(result).to be_nil
      expect(admin.reload.otp_required_for_login?).to be false
    end

    it "não gera códigos de recuperação com código inválido" do
      expect do
        described_class.call(admin: admin, code: "000000")
      end.not_to change(AdminRecoveryCode, :count)
    end
  end
end
