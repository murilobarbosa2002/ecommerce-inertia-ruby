require "rails_helper"

RSpec.describe "AdminPanel::RequireTwoFactor", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:manage_admins) { create(:permission, key: "manage_admins") }
  let(:role_with_permission) { create(:role).tap { |role| role.permissions << manage_admins } }

  it "libera GET pra admin autenticado sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    get root_path

    expect(response).to have_http_status(:ok)
  end

  it "libera HEAD pra admin autenticado sem 2FA ativo (HEAD não é request.get?)" do
    admin = create(:admin)
    sign_in(admin)

    head root_path

    expect(response).to have_http_status(:ok)
  end

  it "bloqueia uma mutação pra admin autenticado sem 2FA ativo" do
    admin = create(:admin, role: role_with_permission)
    sign_in(admin)

    expect do
      post admin_admins_path, params: {
        email_address: "novo-sem-2fa@example.com",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_with_permission.id,
        change_reason: "Teste"
      }
    end.not_to change(Admin, :count)

    expect(response).to redirect_to(root_path)
    expect(flash[:alert]).to eq("Ative a autenticação de dois fatores pra continuar")
  end

  it "permite a mesma mutação pra admin autenticado com 2FA ativo" do
    admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
    sign_in(admin)

    expect do
      post admin_admins_path, params: {
        email_address: "novo-com-2fa@example.com",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_with_permission.id,
        change_reason: "Teste"
      }
    end.to change(Admin, :count).by(1)
  end

  it "não bloqueia ativar o próprio 2FA mesmo sem 2FA ativo ainda" do
    admin = create(:admin)
    sign_in(admin)
    get new_admin_two_factor_path
    code = ROTP::TOTP.new(admin.reload.otp_secret).now

    post admin_two_factor_path, params: { otp_code: code }

    expect(admin.reload.otp_required_for_login?).to be true
  end

  it "não bloqueia deslogar mesmo sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    delete admin_session_path

    expect(response).to redirect_to(new_admin_session_path)
  end
end
