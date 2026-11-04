FactoryBot.define do
  factory :admin_session do
    admin
    ip_address { "127.0.0.1" }
    user_agent { "RSpec" }
  end
end
