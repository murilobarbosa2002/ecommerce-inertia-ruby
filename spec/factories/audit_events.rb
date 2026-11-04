FactoryBot.define do
  factory :audit_event do
    event_type { :login_succeeded }
  end
end
