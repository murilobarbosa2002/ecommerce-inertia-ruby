require "rails_helper"

RSpec.describe "Admin::Dashboards", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  describe "GET / (root)" do
    it "renderiza o dashboard pro admin autenticado" do
      admin = create(:admin)
      sign_in(admin)

      get root_path

      expect(response).to have_http_status(:ok)
    end

    it "redireciona pro login quando não autenticado" do
      get root_path

      expect(response).to redirect_to(new_admin_session_path)
    end
  end

  # Props compartilhadas que o shell do painel (sidebar, menu do usuário)
  # lê em toda página autenticada — lidas pela resposta JSON do Inertia.
  describe "props compartilhadas do shell" do
    def inertia_props
      get root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "expõe o e-mail e o papel do admin logado" do
      admin = create(:admin)
      sign_in(admin)

      expect(inertia_props["current_admin"]).to eq(
        "email_address" => admin.email_address,
        "role_name" => admin.role.name
      )
    end

    it "expõe o nome da loja configurado, sem logo quando não há anexo" do
      StoreSetting.instance.update!(name: "Loja Aurora", change_reason: "Teste")
      sign_in(create(:admin))

      expect(inertia_props["store"]).to eq("name" => "Loja Aurora", "logo_url" => nil)
    end

    it "expõe a URL do logo quando há anexo" do
      setting = StoreSetting.instance
      setting.logo.attach(io: StringIO.new("<svg xmlns='http://www.w3.org/2000/svg'/>"), filename: "logo.svg", content_type: "image/svg+xml")
      setting.update!(change_reason: "Teste")
      sign_in(create(:admin))

      expect(inertia_props.dig("store", "logo_url")).to match(%r{/rails/active_storage/blobs/})
    end

    it "não cria o registro da loja só por renderizar a página (GET não escreve no banco)" do
      StoreSetting.delete_all
      sign_in(create(:admin))

      expect { inertia_props }.not_to change(StoreSetting, :count)
    end

    it "devolve nome vazio (nil) quando a loja ainda não tem nome" do
      StoreSetting.instance
      sign_in(create(:admin))

      expect(inertia_props.dig("store", "name")).to be_nil
    end
  end
end
