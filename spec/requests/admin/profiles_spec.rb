require "rails_helper"

RSpec.describe "Admin::Profiles", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  describe "GET /admin/profile" do
    it "renderiza a página de perfil com o status do 2FA" do
      admin = create(:admin)
      sign_in(admin)

      get admin_profile_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /admin/profile" do
    it "troca a senha com a senha atual correta" do
      admin = create(:admin)
      sign_in(admin)

      patch admin_profile_path, params: {
        current_password: AdminCredentials::VALID_PASSWORD,
        password: AdminCredentials::NEW_VALID_PASSWORD,
        password_confirmation: AdminCredentials::NEW_VALID_PASSWORD
      }

      expect(response).to redirect_to(new_admin_session_path)
      expect(admin.reload.authenticate(AdminCredentials::NEW_VALID_PASSWORD)).to eq(admin)
    end

    it "destrói todas as sessões ativas da conta ao trocar a senha" do
      admin = create(:admin)
      sign_in(admin)
      other_session = admin.admin_sessions.create!(user_agent: "outro dispositivo", ip_address: "127.0.0.1")

      patch admin_profile_path, params: {
        current_password: AdminCredentials::VALID_PASSWORD,
        password: AdminCredentials::NEW_VALID_PASSWORD,
        password_confirmation: AdminCredentials::NEW_VALID_PASSWORD
      }

      expect(AdminSession.exists?(other_session.id)).to be false
      expect(admin.admin_sessions.count).to eq(0)
    end

    it "registra password_changed ao trocar a senha com sucesso" do
      admin = create(:admin)
      sign_in(admin)

      expect do
        patch admin_profile_path, params: {
          current_password: AdminCredentials::VALID_PASSWORD,
          password: AdminCredentials::NEW_VALID_PASSWORD,
          password_confirmation: AdminCredentials::NEW_VALID_PASSWORD
        }
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("password_changed")
    end

    it "não troca a senha com a senha atual errada" do
      admin = create(:admin)
      sign_in(admin)

      patch admin_profile_path, params: {
        current_password: "senha-errada",
        password: AdminCredentials::NEW_VALID_PASSWORD,
        password_confirmation: AdminCredentials::NEW_VALID_PASSWORD
      }

      expect(response).to redirect_to(admin_profile_path)
      expect(flash[:alert]).to eq("Senha atual incorreta")
      expect(admin.reload.authenticate(AdminCredentials::VALID_PASSWORD)).to eq(admin)
    end

    it "não troca a senha quando a nova senha vem em branco" do
      admin = create(:admin)
      sign_in(admin)

      patch admin_profile_path, params: {
        current_password: AdminCredentials::VALID_PASSWORD,
        password: "",
        password_confirmation: ""
      }

      expect(flash[:alert]).to eq("Informe a nova senha")
      expect(admin.reload.authenticate(AdminCredentials::VALID_PASSWORD)).to eq(admin)
      expect(admin.admin_sessions.count).to eq(1)
    end

    it "funciona mesmo sem o admin ter 2FA ativo (não exige 2FA pra trocar senha)" do
      admin = create(:admin)
      sign_in(admin)

      patch admin_profile_path, params: {
        current_password: AdminCredentials::VALID_PASSWORD,
        password: AdminCredentials::NEW_VALID_PASSWORD,
        password_confirmation: AdminCredentials::NEW_VALID_PASSWORD
      }

      expect(response).to redirect_to(new_admin_session_path)
    end
  end
end
