require "rails_helper"

RSpec.describe AdminTwoFactor::DisableTwoFactor do
  describe ".call" do
    it "desativa o 2FA, limpa o secret e os códigos de recuperação" do
      admin = create(:admin)
      AdminTwoFactor::GenerateSecret.call(admin: admin)
      code = ROTP::TOTP.new(admin.otp_secret).now
      AdminTwoFactor::EnableTwoFactor.call(admin: admin, code: code)

      described_class.call(admin: admin)
      admin.reload

      expect(admin.otp_required_for_login?).to be false
      expect(admin.otp_secret).to be_nil
      expect(admin.admin_recovery_codes).to be_empty
    end

    it "registra two_factor_disabled" do
      admin = create(:admin)

      expect do
        described_class.call(admin: admin)
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("two_factor_disabled")
      expect(AuditEvent.last.admin).to eq(admin)
    end
  end
end
