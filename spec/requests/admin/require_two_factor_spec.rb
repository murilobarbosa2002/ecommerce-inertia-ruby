require "rails_helper"

RSpec.describe "AdminPanel::RequireTwoFactor", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:manage_admins) { create(:permission, key: "manage_admins") }
  let(:role_with_permission) { create(:role).tap { |role| role.permissions << manage_admins } }

  it "libera GET no dashboard pra admin autenticado sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    get root_path

    expect(response).to have_http_status(:ok)
  end

  it "libera HEAD no dashboard pra admin autenticado sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    head root_path

    expect(response).to have_http_status(:ok)
  end

  it "libera GET no próprio perfil pra admin autenticado sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    get admin_profile_path

    expect(response).to have_http_status(:ok)
  end

  # Bug real (docs/bugs/two-factor-authentication.md): antes desta regra
  # cobrir GET, qualquer página respondia normalmente a um admin sem 2FA —
  # só um modal no cliente escondia o conteúdo já entregue. Navegar direto
  # pra uma URL sem passar pela UI (ou chamar o endpoint via curl/script)
  # via GET nunca era bloqueado por nada no servidor.
  it "bloqueia GET em qualquer página fora do dashboard/perfil/configurar 2FA, redirecionando pra configurar o 2FA" do
    admin = create(:admin, role: role_with_permission)
    sign_in(admin)

    get admin_admins_path

    expect(response).to redirect_to(new_admin_two_factor_path)
    expect(flash[:alert]).to eq("Ative a autenticação de dois fatores pra continuar")
  end

  it "bloqueia HEAD do mesmo jeito que GET" do
    admin = create(:admin, role: role_with_permission)
    sign_in(admin)

    head admin_admins_path

    expect(response).to redirect_to(new_admin_two_factor_path)
  end

  it "permite GET na mesma página pra admin autenticado com 2FA ativo" do
    admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
    sign_in(admin)

    get admin_admins_path

    expect(response).to have_http_status(:ok)
  end

  it "bloqueia uma mutação pra admin autenticado sem 2FA ativo" do
    admin = create(:admin, role: role_with_permission)
    sign_in(admin)

    expect do
      post admin_admins_path, params: {
        email_address: "novo-sem-2fa@example.com",
        first_name: "Novo",
        last_name: "Admin",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_with_permission.id,
        change_reason: "Teste"
      }
    end.not_to change(Admin, :count)

    expect(response).to redirect_to(new_admin_two_factor_path)
    expect(flash[:alert]).to eq("Ative a autenticação de dois fatores pra continuar")
  end

  it "permite a mesma mutação pra admin autenticado com 2FA ativo" do
    admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
    sign_in(admin)

    expect do
      post admin_admins_path, params: {
        email_address: "novo-com-2fa@example.com",
        first_name: "Novo",
        last_name: "Admin",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_with_permission.id,
        change_reason: "Teste"
      }
    end.to change(Admin, :count).by(1)
  end

  it "não bloqueia ver nem ativar o próprio 2FA mesmo sem 2FA ativo ainda" do
    admin = create(:admin)
    sign_in(admin)
    get new_admin_two_factor_path
    code = ROTP::TOTP.new(admin.reload.otp_secret).now

    post admin_two_factor_path, params: { otp_code: code }

    expect(admin.reload.otp_required_for_login?).to be true
  end

  it "não bloqueia trocar a própria senha mesmo sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    patch admin_profile_path, params: {
      current_password: AdminCredentials::VALID_PASSWORD,
      password: "NovaSenha123!",
      password_confirmation: "NovaSenha123!"
    }

    expect(response).to redirect_to(new_admin_session_path)
  end

  it "não bloqueia deslogar mesmo sem 2FA ativo" do
    admin = create(:admin)
    sign_in(admin)

    delete admin_session_path

    expect(response).to redirect_to(new_admin_session_path)
  end
end
