module AdminPanel
  class BaseController < ApplicationController
    include AdminPanel::Authentication
    include AdminPanel::Authorization
    include AdminPanel::RequireTwoFactor

    before_action :set_paper_trail_whodunnit

    # Permissões e status do 2FA do admin logado, pra qualquer página
    # condicionar nav/UI sem cada controller precisar compartilhar isso
    # individualmente (docs/adr/0021, docs/adr/0023) — valores vazios/false
    # nas páginas pré-autenticação (login, reset de senha), nunca usados lá.
    inertia_share do
      {
        current_admin_permissions: Current.admin&.role&.permissions&.pluck(:key) || [],
        current_admin_two_factor_enabled: Current.admin&.otp_required_for_login? || false,
        # Pra UI condicionar uma ação sobre "o admin sendo visto é o próprio
        # admin logado" (ex. esconder o botão de resetar 2FA na própria
        # conta) sem precisar comparar e-mail — nil nas páginas
        # pré-autenticação, igual aos outros dois valores acima.
        current_admin_id: Current.admin&.id,
        # Identidade do admin logado e da loja pro shell do painel (menu do
        # usuário, marca da sidebar) — nil nas páginas pré-autenticação.
        current_admin: current_admin_json,
        store: store_json
      }
    end

    def user_for_paper_trail
      Current.admin&.id
    end

    private

    def current_admin_json
      admin = Current.admin
      return unless admin

      { email_address: admin.email_address, role_name: admin.role.name }
    end

    # Não usa StoreSetting.instance: ele cria o registro quando não existe, e
    # compartilhar props numa requisição GET nunca deve escrever no banco.
    def store_json
      setting = StoreSetting.first
      return { name: nil, logo_url: nil } unless setting

      {
        name: setting.name.presence,
        logo_url: setting.logo.attached? ? url_for(setting.logo) : nil
      }
    end
  end
end
