require "rails_helper"

RSpec.describe "Admin::TwoFactorAuthentications", type: :request do
  def admin_with_two_factor
    admin = create(:admin)
    AdminTwoFactor::GenerateSecret.call(admin: admin)
    code = ROTP::TOTP.new(admin.otp_secret).now
    recovery_codes = AdminTwoFactor::EnableTwoFactor.call(admin: admin, code: code)
    [ admin.reload, recovery_codes ]
  end

  def start_pending_login(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  describe "POST /admin/login com 2FA ativo" do
    it "não cria sessão real, redireciona pra tela de verificação" do
      admin, = admin_with_two_factor

      start_pending_login(admin)

      expect(response).to redirect_to(new_admin_two_factor_authentication_path)
      expect(cookies[:admin_session_id]).to be_blank
    end
  end

  describe "POST /admin/two-factor" do
    it "completa o login com código TOTP válido" do
      admin, = admin_with_two_factor
      start_pending_login(admin)

      # A confirmação do setup (admin_with_two_factor) já consumiu o código
      # da janela atual de 30s — avança o tempo pra gerar um código novo,
      # senão a proteção contra replay rejeitaria (mesmo código reusado).
      travel_to 31.seconds.from_now do
        code = ROTP::TOTP.new(admin.otp_secret).now

        post admin_two_factor_authentication_path, params: { otp_code: code }

        expect(response).to redirect_to(root_path)
        expect(cookies[:admin_session_id]).to be_present
      end
    end

    it "registra two_factor_verified e login_succeeded com código TOTP válido" do
      admin, = admin_with_two_factor
      start_pending_login(admin)

      travel_to 31.seconds.from_now do
        code = ROTP::TOTP.new(admin.otp_secret).now

        expect do
          post admin_two_factor_authentication_path, params: { otp_code: code }
        end.to change(AuditEvent, :count).by(2)

        event_types = AuditEvent.last(2).map(&:event_type)
        expect(event_types).to contain_exactly("two_factor_verified", "login_succeeded")
      end
    end

    it "completa o login com código de recuperação válido" do
      admin, recovery_codes = admin_with_two_factor
      start_pending_login(admin)

      post admin_two_factor_authentication_path, params: { otp_code: recovery_codes.first }

      expect(response).to redirect_to(root_path)
      expect(cookies[:admin_session_id]).to be_present
    end

    it "registra recovery_code_used e login_succeeded com código de recuperação válido" do
      admin, recovery_codes = admin_with_two_factor
      start_pending_login(admin)

      expect do
        post admin_two_factor_authentication_path, params: { otp_code: recovery_codes.first }
      end.to change(AuditEvent, :count).by(2)

      event_types = AuditEvent.last(2).map(&:event_type)
      expect(event_types).to contain_exactly("recovery_code_used", "login_succeeded")
    end

    it "rejeita código errado com mensagem genérica e incrementa tentativas" do
      admin, = admin_with_two_factor
      start_pending_login(admin)

      post admin_two_factor_authentication_path, params: { otp_code: "000000" }

      expect(response).to redirect_to(new_admin_two_factor_authentication_path)
      expect(flash[:alert]).to eq("Código inválido")
      expect(admin.reload.failed_login_attempts).to eq(1)
    end

    it "bloqueia a conta após 5 códigos errados, mesmo bloqueio da senha" do
      admin, = admin_with_two_factor
      start_pending_login(admin)

      5.times { post admin_two_factor_authentication_path, params: { otp_code: "000000" } }

      expect(admin.reload.locked_at).to be_present
    end

    it "rejeita código correto quando a conta está bloqueada" do
      admin, = admin_with_two_factor
      start_pending_login(admin)
      # Bloqueio aplicado depois da sessão pendente já existir — simula a
      # conta sendo bloqueada (ex. por outra tentativa concorrente) enquanto
      # essa verificação de 2FA ainda está em aberto.
      admin.update!(failed_login_attempts: 5, locked_at: Time.current)
      code = ROTP::TOTP.new(admin.otp_secret).now

      post admin_two_factor_authentication_path, params: { otp_code: code }

      expect(response).to redirect_to(new_admin_two_factor_authentication_path)
      expect(cookies[:admin_session_id]).to be_blank
    end
  end

  describe "sessão de verificação pendente" do
    it "sem sessão pendente, redireciona pro login com mensagem genérica" do
      get new_admin_two_factor_authentication_path

      expect(response).to redirect_to(new_admin_session_path)
      expect(flash[:alert]).to eq("Sessão de verificação expirada, faça login novamente")
    end

    it "sessão pendente expirada (passados 5min) redireciona pro login" do
      admin, = admin_with_two_factor
      start_pending_login(admin)

      travel_to 6.minutes.from_now do
        get new_admin_two_factor_authentication_path

        expect(response).to redirect_to(new_admin_session_path)
        expect(flash[:alert]).to eq("Sessão de verificação expirada, faça login novamente")
      end
    end
  end
end
