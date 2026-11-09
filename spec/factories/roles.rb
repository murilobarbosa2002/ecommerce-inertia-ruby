FactoryBot.define do
  factory :role do
    sequence(:name) { |n| "role-#{n}" }
    change_reason { "Setup de teste" }
  end
end
