require "rails_helper"

RSpec.describe AuditEvents::RecordAuditEvent do
  describe ".call" do
    it "persiste um evento com os dados mínimos" do
      expect do
        described_class.call(event_type: :login_failed)
      end.to change(AuditEvent, :count).by(1)

      audit_event = AuditEvent.last
      expect(audit_event.event_type).to eq("login_failed")
      expect(audit_event.admin).to be_nil
      expect(audit_event.ip_address).to be_nil
      expect(audit_event.user_agent).to be_nil
      expect(audit_event.metadata).to eq({})
    end

    it "associa o admin quando informado" do
      admin = create(:admin)

      described_class.call(event_type: :login_succeeded, admin: admin)

      expect(AuditEvent.last.admin).to eq(admin)
    end

    it "extrai ip e user agent da request quando informada" do
      request = instance_double(ActionDispatch::Request, remote_ip: "203.0.113.5", user_agent: "RSpec/1.0")

      described_class.call(event_type: :login_succeeded, request: request)

      audit_event = AuditEvent.last
      expect(audit_event.ip_address).to eq("203.0.113.5")
      expect(audit_event.user_agent).to eq("RSpec/1.0")
    end

    it "persiste metadata arbitrária" do
      described_class.call(event_type: :two_factor_failed, metadata: { attempt: 3 })

      expect(AuditEvent.last.metadata).to eq("attempt" => 3)
    end

    it "aceita qualquer event_type mapeado" do
      expected_event_types = %w[
        login_succeeded login_failed account_locked account_unlocked logout
        two_factor_enabled two_factor_disabled two_factor_verified two_factor_failed
        recovery_code_used password_reset_requested password_reset_completed
      ]

      expected_event_types.each do |event_type|
        expect do
          described_class.call(event_type: event_type)
        end.to change(AuditEvent, :count).by(1)
      end
    end
  end
end
