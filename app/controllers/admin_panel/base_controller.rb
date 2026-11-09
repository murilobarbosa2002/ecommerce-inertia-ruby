module AdminPanel
  class BaseController < ApplicationController
    include AdminPanel::Authentication
    include AdminPanel::Authorization

    before_action :set_paper_trail_whodunnit

    # Permissões do admin logado, pra qualquer página condicionar nav/UI sem
    # cada controller precisar compartilhar isso individualmente (docs/adr/0021)
    # — array vazio nas páginas pré-autenticação (login, reset de senha),
    # nunca usado lá.
    inertia_share do
      { current_admin_permissions: Current.admin&.role&.permissions&.pluck(:key) || [] }
    end

    def user_for_paper_trail
      Current.admin&.id
    end
  end
end
