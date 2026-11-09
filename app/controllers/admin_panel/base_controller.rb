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
        current_admin_two_factor_enabled: Current.admin&.otp_required_for_login? || false
      }
    end

    def user_for_paper_trail
      Current.admin&.id
    end
  end
end
