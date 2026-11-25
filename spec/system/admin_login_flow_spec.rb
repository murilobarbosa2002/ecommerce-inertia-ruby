require "rails_helper"

# Primeiro spec de sistema do projeto (Capybara + Cuprite, Chromium headless
# real) — cobre o fluxo de login dirigindo o navegador pelas páginas React
# de verdade, não só os requests HTTP isolados já cobertos em
# sessions_spec.rb/two_factor_authentications_spec.rb. É o único tipo de
# teste que pegaria uma quebra na integração entre o controller e a página
# React (ex. rota errada, prop que não bate com o que a página espera).
RSpec.describe "Fluxo de login do admin", type: :system do
  it "sem 2FA ativo, login vai direto pro dashboard" do
    admin = create(:admin)

    visit new_admin_session_path
    fill_in "E-mail", with: admin.email_address
    fill_in "Senha", with: AdminCredentials::VALID_PASSWORD
    click_button "Entrar"

    expect(page).to have_current_path(root_path)
    expect(page).to have_content("Painel")
  end

  it "com 2FA ativo, login passa pela verificação antes do dashboard" do
    admin = create(:admin, :with_two_factor_enabled)

    visit new_admin_session_path
    fill_in "E-mail", with: admin.email_address
    fill_in "Senha", with: AdminCredentials::VALID_PASSWORD
    click_button "Entrar"

    expect(page).to have_current_path(new_admin_two_factor_authentication_path)
    expect(page).to have_content("Verificação em duas etapas")

    fill_in "Código", with: ROTP::TOTP.new(admin.otp_secret).now
    click_button "Verificar"

    expect(page).to have_current_path(root_path)
    expect(page).to have_content("Painel")
  end

  it "código de 2FA errado mostra erro e não deixa passar" do
    admin = create(:admin, :with_two_factor_enabled)

    visit new_admin_session_path
    fill_in "E-mail", with: admin.email_address
    fill_in "Senha", with: AdminCredentials::VALID_PASSWORD
    click_button "Entrar"

    fill_in "Código", with: "000000"
    click_button "Verificar"

    expect(page).to have_current_path(new_admin_two_factor_authentication_path)
    expect(page).to have_content("Código inválido")
  end
end
