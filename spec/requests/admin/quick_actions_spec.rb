require "rails_helper"

RSpec.describe "Admin::QuickActions", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    # Com 2FA ativo, a senha certa só deixa o login "pendente" — precisa
    # confirmar o código TOTP pra criar a AdminSession de verdade.
    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  describe "PATCH /admin/quick_actions" do
    it "salva as chaves escolhidas na conta do próprio admin logado" do
      admin = create(:admin, :with_two_factor_enabled)
      sign_in(admin)

      patch admin_quick_actions_path, params: { quick_action_keys: [ "new_admin", "new_role" ] }

      expect(admin.reload.quick_action_keys).to eq([ "new_admin", "new_role" ])
    end

    it "redireciona pro dashboard com um aviso de sucesso" do
      admin = create(:admin, :with_two_factor_enabled)
      sign_in(admin)

      patch admin_quick_actions_path, params: { quick_action_keys: [ "new_admin" ] }

      expect(response).to redirect_to(root_path)
      expect(flash[:notice]).to eq("Atalhos do dashboard atualizados")
    end

    it "aceita lista vazia (remover todos os atalhos escolhidos)" do
      admin = create(:admin, :with_two_factor_enabled, quick_action_keys: [ "new_admin" ])
      sign_in(admin)

      patch admin_quick_actions_path, params: { quick_action_keys: [] }

      expect(admin.reload.quick_action_keys).to eq([])
    end

    it "nunca altera a conta de outro admin, só a do autenticado" do
      other_admin = create(:admin, quick_action_keys: [ "new_admin" ])
      admin = create(:admin, :with_two_factor_enabled)
      sign_in(admin)

      patch admin_quick_actions_path, params: { quick_action_keys: [ "new_role" ] }

      expect(other_admin.reload.quick_action_keys).to eq([ "new_admin" ])
    end

    it "bloqueia quem não tem 2FA ativo (mutação exige 2FA, docs/adr/0023)" do
      admin = create(:admin)
      sign_in(admin)

      patch admin_quick_actions_path, params: { quick_action_keys: [ "new_admin" ] }

      expect(response).to redirect_to(new_admin_two_factor_path)
      expect(admin.reload.quick_action_keys).to eq([])
    end

    it "redireciona pro login quando não autenticado" do
      patch admin_quick_actions_path, params: { quick_action_keys: [ "new_admin" ] }

      expect(response).to redirect_to(new_admin_session_path)
    end
  end
end
