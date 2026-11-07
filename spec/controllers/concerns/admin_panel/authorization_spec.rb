require "rails_helper"

# Nenhum controller real do painel usa require_permission ainda (só a partir
# da fase de gerenciar admins, docs/adr/0021) — testado via
# AdminPanel::AuthorizationTestController, controller só de teste (rota só
# existe em Rails.env.test?, ver config/routes.rb).
RSpec.describe AdminPanel::Authorization, type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  it "permite acesso quando a role do admin tem a permissão exigida" do
    permission = create(:permission, key: "manage_admins")
    role = create(:role)
    role.permissions << permission
    admin = create(:admin, role: role)
    sign_in(admin)

    get "/admin/authorization-test"

    expect(response).to have_http_status(:ok)
  end

  it "bloqueia acesso quando a role do admin não tem a permissão exigida" do
    admin = create(:admin)
    sign_in(admin)

    get "/admin/authorization-test"

    expect(response).to have_http_status(:forbidden)
  end
end
