require "rails_helper"

RSpec.describe AdminAuthentication::ResetFailedLoginAttempts do
  describe ".call" do
    it "zera failed_login_attempts e limpa locked_at" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)

      described_class.call(admin: admin)

      expect(admin.reload.failed_login_attempts).to eq(0)
      expect(admin.locked_at).to be_nil
    end
  end
end
