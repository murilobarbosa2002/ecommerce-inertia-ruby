require "rails_helper"

# Nenhum controller real usa require_permission ainda (só a partir da fase
# de gerenciar admins, docs/adr/0021) — testado aqui via rota/controller
# temporários (Rails.application.routes.draw + reload_routes!), não através
# de um controller de produto que ainda não existe.
RSpec.describe AdminPanel::Authorization, type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  around do |example|
    # .append (não .draw) — .draw substitui o route set inteiro, o que
    # apagaria admin_session_path e quebraria o sign_in; .append só
    # acrescenta a rota de teste no fim, preservando as rotas reais.
    Rails.application.routes.append do
      get "/authorization_test" => "authorization_test#show"
    end
    example.run
  ensure
    Rails.application.reload_routes!
  end

  before do
    stub_const("AuthorizationTestController", Class.new(AdminPanel::BaseController) do
      require_permission :manage_admins

      def show
        head :ok
      end
    end)
  end

  it "permite acesso quando a role do admin tem a permissão exigida" do
    permission = create(:permission, key: "manage_admins")
    role = create(:role)
    role.permissions << permission
    admin = create(:admin, role: role)
    sign_in(admin)

    get "/authorization_test"

    expect(response).to have_http_status(:ok)
  end

  it "bloqueia acesso quando a role do admin não tem a permissão exigida" do
    admin = create(:admin)
    sign_in(admin)

    get "/authorization_test"

    expect(response).to have_http_status(:forbidden)
  end
end
