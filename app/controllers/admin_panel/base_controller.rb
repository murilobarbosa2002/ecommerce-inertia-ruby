module AdminPanel
  class BaseController < ApplicationController
    include AdminPanel::Authentication
    include AdminPanel::Authorization

    before_action :set_paper_trail_whodunnit

    # PENDING-FRONTEND: sem verificação de ponta a ponta ainda — nenhum
    # controller atual edita um campo rastreado por change_reason
    # (email_address do Admin); fica verificável quando a tela de gerenciar
    # admins existir (fase de RBAC, ver docs/adr/0013).
    def user_for_paper_trail
      Current.admin&.id
    end
  end
end
