require "rails_helper"

RSpec.describe AuditEvent, type: :model do
  describe "validações" do
    it { is_expected.to validate_presence_of(:event_type) }
  end

  describe "associações" do
    it { is_expected.to belong_to(:admin).optional }
  end

  describe "event_type" do
    let(:expected_event_types) do
      %w[
        login_succeeded login_failed account_locked account_unlocked logout
        two_factor_enabled two_factor_disabled two_factor_verified two_factor_failed
        recovery_code_used password_reset_requested password_reset_completed
        password_verified reauthentication_failed password_changed
      ]
    end

    it "mapeia exatamente os eventos de negócio decididos até agora (docs/adr/0013, docs/adr/0023)" do
      expect(AuditEvent.event_types.keys).to contain_exactly(*expected_event_types)
    end

    it "aceita qualquer evento de negócio mapeado" do
      expected_event_types.each do |event_type|
        audit_event = build(:audit_event, event_type: event_type)

        expect(audit_event).to be_valid
      end
    end
  end
end
