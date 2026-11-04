require "rails_helper"

RSpec.describe "Admin::Sessions", type: :request do
  describe "POST /admin/login" do
    it "autentica com credenciais corretas e cria uma sessão" do
      admin = create(:admin)

      post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }

      expect(response).to redirect_to(root_path)
      expect(cookies[:admin_session_id]).to be_present
      expect(admin.admin_sessions.count).to eq(1)
    end

    it "registra password_verified e login_succeeded quando não há 2FA" do
      admin = create(:admin)

      expect do
        post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
      end.to change(AuditEvent, :count).by(2)

      event_types = AuditEvent.last(2).map(&:event_type)
      expect(event_types).to contain_exactly("password_verified", "login_succeeded")
    end

    it "rejeita senha errada com mensagem genérica" do
      admin = create(:admin)

      post admin_session_path, params: { email_address: admin.email_address, password: "senha-errada" }

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:alert]).to eq("E-mail ou senha inválidos")
      expect(cookies[:admin_session_id]).to be_blank
    end

    it "bloqueia a conta após 5 tentativas erradas" do
      admin = create(:admin)

      5.times do
        post admin_session_path, params: { email_address: admin.email_address, password: "senha-errada" }
      end

      expect(admin.reload.locked_at).to be_present
    end

    it "rejeita a conta bloqueada mesmo com a senha correta, com a mesma mensagem genérica" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)

      post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:alert]).to eq("E-mail ou senha inválidos")
    end

    it "libera a conta depois que o bloqueio de 15 minutos expira" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: 16.minutes.ago)

      post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }

      expect(response).to redirect_to(root_path)
      expect(admin.reload.locked_at).to be_nil
    end
  end

  describe "DELETE /admin/login" do
    it "termina a sessão atual" do
      admin = create(:admin)
      post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }

      expect { delete admin_session_path }.to change(AdminSession, :count).by(-1)
      expect(response).to redirect_to(new_admin_session_path)
    end

    it "registra o evento de logout com o admin certo" do
      admin = create(:admin)
      post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }

      expect { delete admin_session_path }.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("logout")
      expect(AuditEvent.last.admin).to eq(admin)
    end
  end
end
