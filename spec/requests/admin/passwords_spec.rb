require "rails_helper"

RSpec.describe "Admin::Passwords", type: :request do
  describe "POST /admin/passwords" do
    it "envia o e-mail de reset quando a conta existe" do
      admin = create(:admin)

      expect do
        post admin_passwords_path, params: { email_address: admin.email_address }
      end.to have_enqueued_mail(AdminPanel::PasswordsMailer, :reset).with(admin)

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:notice]).to eq("Se esse e-mail existir, enviamos instruções de redefinição de senha")
    end

    it "responde com a mesma mensagem genérica quando a conta não existe" do
      expect do
        post admin_passwords_path, params: { email_address: "inexistente@example.com" }
      end.not_to have_enqueued_mail(AdminPanel::PasswordsMailer, :reset)

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:notice]).to eq("Se esse e-mail existir, enviamos instruções de redefinição de senha")
    end

    it "registra password_reset_requested mesmo quando a conta não existe" do
      expect do
        post admin_passwords_path, params: { email_address: "inexistente@example.com" }
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("password_reset_requested")
      expect(AuditEvent.last.admin).to be_nil
    end
  end

  describe "GET /admin/passwords/:token/edit" do
    it "redireciona com mensagem genérica quando o token é inválido" do
      get edit_admin_password_path("token-invalido")

      expect(response).to redirect_to(new_admin_password_path)
      expect(flash[:alert]).to eq("Link de redefinição de senha inválido ou expirado")
    end

    it "redireciona com a mesma mensagem quando o token expirou" do
      admin = create(:admin)
      token = admin.password_reset_token

      travel_to 16.minutes.from_now do
        get edit_admin_password_path(token)

        expect(response).to redirect_to(new_admin_password_path)
        expect(flash[:alert]).to eq("Link de redefinição de senha inválido ou expirado")
      end
    end
  end

  describe "PATCH /admin/passwords/:token" do
    it "redefine a senha com um token válido" do
      admin = create(:admin)
      token = admin.password_reset_token

      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:notice]).to eq("Senha redefinida com sucesso")
      expect(admin.reload.authenticate(AdminCredentials::NEW_VALID_PASSWORD)).to eq(admin)
    end

    it "destrói todas as sessões ativas do admin ao redefinir a senha" do
      admin = create(:admin)
      create_list(:admin_session, 2, admin: admin)
      token = admin.password_reset_token

      expect do
        patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }
      end.to change { admin.admin_sessions.count }.from(2).to(0)
    end

    it "registra password_reset_completed ao redefinir com sucesso" do
      admin = create(:admin)
      token = admin.password_reset_token

      expect do
        patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("password_reset_completed")
      expect(AuditEvent.last.admin).to eq(admin)
    end

    it "não redefine a senha quando a confirmação não bate" do
      admin = create(:admin)
      token = admin.password_reset_token

      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: "outra-coisa" }

      expect(response).to redirect_to(edit_admin_password_path(token))
      expect(flash[:alert]).to eq("Não foi possível redefinir a senha")
      expect(admin.reload.authenticate(AdminCredentials::VALID_PASSWORD)).to eq(admin)
    end

    it "limpa um bloqueio de conta ativo ao redefinir a senha com sucesso" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)
      token = admin.password_reset_token

      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }

      expect(admin.reload.locked_at).to be_nil
      expect(admin.failed_login_attempts).to eq(0)
    end

    it "registra account_unlocked quando o reset limpa um bloqueio ativo" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)
      token = admin.password_reset_token

      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }

      expect(AuditEvent.where(event_type: :account_unlocked, admin: admin)).to exist
    end

    it "não registra account_unlocked quando a conta não estava bloqueada" do
      admin = create(:admin)
      token = admin.password_reset_token

      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }

      expect(AuditEvent.where(event_type: :account_unlocked, admin: admin)).not_to exist
    end

    it "não aceita mais o mesmo token depois de usado" do
      admin = create(:admin)
      token = admin.password_reset_token
      patch admin_password_path(token), params: { password: AdminCredentials::NEW_VALID_PASSWORD, password_confirmation: AdminCredentials::NEW_VALID_PASSWORD }

      get edit_admin_password_path(token)

      expect(response).to redirect_to(new_admin_password_path)
      expect(flash[:alert]).to eq("Link de redefinição de senha inválido ou expirado")
    end
  end
end
