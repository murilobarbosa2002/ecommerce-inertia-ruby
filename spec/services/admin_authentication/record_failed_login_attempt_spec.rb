require "rails_helper"

RSpec.describe AdminAuthentication::RecordFailedLoginAttempt do
  describe ".call" do
    it "incrementa failed_login_attempts" do
      admin = create(:admin)

      expect { described_class.call(admin: admin) }.to change { admin.reload.failed_login_attempts }.by(1)
    end

    it "não bloqueia a conta antes de atingir o limite" do
      admin = create(:admin, failed_login_attempts: 3)

      described_class.call(admin: admin)

      expect(admin.reload.locked_at).to be_nil
    end

    it "registra login_failed enquanto não atinge o limite" do
      admin = create(:admin, failed_login_attempts: 3)

      expect { described_class.call(admin: admin) }.to change(AuditEvent, :count).by(1)
      expect(AuditEvent.last.event_type).to eq("login_failed")
      expect(AuditEvent.last.admin).to eq(admin)
    end

    it "bloqueia a conta ao atingir o limite de tentativas" do
      admin = create(:admin, failed_login_attempts: described_class::MAX_ATTEMPTS - 1)

      described_class.call(admin: admin)

      expect(admin.reload.locked_at).to be_within(2.seconds).of(Time.current)
    end

    it "registra account_locked ao atingir o limite de tentativas" do
      admin = create(:admin, failed_login_attempts: described_class::MAX_ATTEMPTS - 1)

      described_class.call(admin: admin)

      expect(AuditEvent.last.event_type).to eq("account_locked")
    end
  end
end
