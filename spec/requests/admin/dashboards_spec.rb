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
end
