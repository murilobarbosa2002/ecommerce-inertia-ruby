FactoryBot.define do
  factory :admin_recovery_code do
    admin
    sequence(:code_digest) { |n| "digest-#{n}" }
    used_at { nil }
  end
end
