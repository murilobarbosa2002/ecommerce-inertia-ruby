FactoryBot.define do
  factory :admin_session do
    admin
    ip_address { "127.0.0.1" }
    user_agent { "RSpec" }
    expires_at { 24.hours.from_now }
  end
end
