FactoryBot.define do
  factory :admin do
    sequence(:email_address) { |n| "admin#{n}@example.com" }
    password { AdminCredentials::VALID_PASSWORD }
    password_confirmation { AdminCredentials::VALID_PASSWORD }
  end
end
