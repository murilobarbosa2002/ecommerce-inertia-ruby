# Controller só de teste (rota só existe em Rails.env.test?, ver
# config/routes.rb) — exercita AdminPanel::Authorization de ponta a ponta
# (spec/controllers/concerns/admin_panel/authorization_spec.rb) sem depender
# de um controller real do painel, que ainda não existe (docs/adr/0021).
module AdminPanel
  class AuthorizationTestController < BaseController
    require_permission :manage_admins

    def show
      head :ok
    end
  end
end
