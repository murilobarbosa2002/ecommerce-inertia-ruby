require "rails_helper"

RSpec.describe "Admin::TwoFactors", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  describe "GET /admin/two-factor-setup/new" do
    it "gera um secret TOTP novo pro admin autenticado" do
      admin = create(:admin)
      sign_in(admin)

      get new_admin_two_factor_path

      expect(admin.reload.otp_secret).to be_present
    end

    it "gera um qr_code_svg visível: <svg> de verdade (standalone) com width/height explícitos" do
      admin = create(:admin)
      sign_in(admin)

      get new_admin_two_factor_path

      # Props do Inertia vêm embutidas em data-page (JSON), não um endpoint
      # JSON puro — extrai do HTML renderizado, mesmo formato que o
      # @inertiajs/react lê no cliente de verdade.
      page_data = JSON.parse(response.body[/data-page="app" type="application\/json">(.*?)<\/script>/m, 1])
      qr_code_svg = page_data["props"]["qr_code_svg"]

      expect(qr_code_svg).to include("<svg")
      expect(qr_code_svg).to include("</svg>")
      # width/height explícitos em pixel, não só viewBox — o <svg> é
      # injetado cru via dangerouslySetInnerHTML (fora do alcance de
      # classe Tailwind), então precisa de tamanho próprio pra não
      # depender de CSS externo nenhum pra ficar visível.
      expect(qr_code_svg).to match(/width="\d+"/)
      expect(qr_code_svg).to match(/height="\d+"/)
    end

    it "não sobrescreve o secret quando o 2FA já está ativo (evitaria travar o login)" do
      admin = create(:admin)
      sign_in(admin)
      get new_admin_two_factor_path
      code = ROTP::TOTP.new(admin.reload.otp_secret).now
      post admin_two_factor_path, params: { otp_code: code }
      active_secret = admin.reload.otp_secret

      get new_admin_two_factor_path

      expect(admin.reload.otp_secret).to eq(active_secret)
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("A autenticação de dois fatores já está ativa")
    end
  end

  describe "POST /admin/two-factor-setup" do
    it "ativa o 2FA com código de confirmação válido" do
      admin = create(:admin)
      sign_in(admin)
      get new_admin_two_factor_path
      code = ROTP::TOTP.new(admin.reload.otp_secret).now

      post admin_two_factor_path, params: { otp_code: code }

      expect(admin.reload.otp_required_for_login?).to be true
    end

    it "não ativa o 2FA com código de confirmação inválido" do
      admin = create(:admin)
      sign_in(admin)
      get new_admin_two_factor_path

      post admin_two_factor_path, params: { otp_code: "000000" }

      expect(response).to redirect_to(new_admin_two_factor_path)
      expect(flash[:alert]).to eq("Código inválido")
      expect(admin.reload.otp_required_for_login?).to be false
    end
  end

  describe "DELETE /admin/two-factor-setup" do
    it "desativa o 2FA com a senha atual correta" do
      admin = create(:admin)
      sign_in(admin)
      get new_admin_two_factor_path
      code = ROTP::TOTP.new(admin.reload.otp_secret).now
      post admin_two_factor_path, params: { otp_code: code }

      delete admin_two_factor_path, params: { password: AdminCredentials::VALID_PASSWORD }

      expect(admin.reload.otp_required_for_login?).to be false
      expect(flash[:notice]).to eq("Autenticação de dois fatores desativada")
    end

    it "não desativa o 2FA com senha atual errada" do
      admin = create(:admin)
      sign_in(admin)
      get new_admin_two_factor_path
      code = ROTP::TOTP.new(admin.reload.otp_secret).now
      post admin_two_factor_path, params: { otp_code: code }

      delete admin_two_factor_path, params: { password: "senha-errada" }

      expect(admin.reload.otp_required_for_login?).to be true
      expect(flash[:alert]).to eq("Senha incorreta")
    end

    it "registra reauthentication_failed (não login_failed) com senha atual errada" do
      admin = create(:admin)
      sign_in(admin)

      expect do
        delete admin_two_factor_path, params: { password: "senha-errada" }
      end.to change(AuditEvent, :count).by(1)

      expect(AuditEvent.last.event_type).to eq("reauthentication_failed")
    end

    it "bloqueia a conta após 5 senhas erradas tentando desativar o 2FA" do
      admin = create(:admin)
      sign_in(admin)

      5.times { delete admin_two_factor_path, params: { password: "senha-errada" } }

      expect(admin.reload.locked_at).to be_present
    end
  end
end
