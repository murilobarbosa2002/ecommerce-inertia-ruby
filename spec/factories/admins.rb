FactoryBot.define do
  factory :admin do
    sequence(:email_address) { |n| "admin#{n}@example.com" }
    password { AdminCredentials::VALID_PASSWORD }
    password_confirmation { AdminCredentials::VALID_PASSWORD }
    change_reason { "Setup de teste" }
    association :role

    # Pra specs que exercitam uma ação autenticada qualquer sem o 2FA ser o
    # foco — sem isso, toda mutação (docs/adr/0023) seria bloqueada, já que
    # o admin padrão da factory não tem 2FA ativo (estado real de uma conta
    # recém-criada).
    trait :with_two_factor_enabled do
      otp_required_for_login { true }
      otp_secret { ROTP::Base32.random }
    end
  end
end
