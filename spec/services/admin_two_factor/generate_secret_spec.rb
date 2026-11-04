require "rails_helper"

RSpec.describe AdminTwoFactor::GenerateSecret do
  describe ".call" do
    it "gera e salva um secret TOTP válido" do
      admin = create(:admin)

      described_class.call(admin: admin)

      expect(admin.reload.otp_secret).to be_present
      expect { ROTP::TOTP.new(admin.otp_secret).now }.not_to raise_error
    end

    it "gera um secret diferente a cada chamada" do
      admin = create(:admin)

      described_class.call(admin: admin)
      first_secret = admin.reload.otp_secret

      described_class.call(admin: admin)
      second_secret = admin.reload.otp_secret

      expect(first_secret).not_to eq(second_secret)
    end
  end
end
