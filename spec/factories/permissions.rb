FactoryBot.define do
  factory :permission do
    sequence(:key) { |n| "permission_#{n}" }
    description { "Permissão de teste" }
  end
end
