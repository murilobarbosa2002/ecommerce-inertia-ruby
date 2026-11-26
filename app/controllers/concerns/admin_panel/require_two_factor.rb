module AdminPanel
  module RequireTwoFactor
    extend ActiveSupport::Concern

    included do
      before_action :require_two_factor!
    end

    private

    # Bloqueia todo verbo (GET/HEAD inclusos) de um admin já autenticado sem
    # 2FA ativo — não só mutação (docs/adr/0040, que substituiu a parte de
    # docs/adr/0023 que liberava GET/HEAD: liberar visualização entregava
    # dado real de outras contas por trás só de um modal client-side, sem
    # nenhuma autoridade de servidor por trás). As únicas telas que um admin
    # sem 2FA pode ver são o dashboard e o próprio perfil — cada controller
    # que precisa ficar acessível sem 2FA usa `skip_before_action
    # :require_two_factor!` explícito (`DashboardsController`,
    # `ProfilesController#show`/`#update`, `TwoFactorsController`). Qualquer
    # outra rota redireciona pra tela de configurar o 2FA.
    # `Current.admin` nulo (login, reset de senha, verificação de 2FA no
    # login — nenhum desses exige sessão) não passa por aqui: essa regra é
    # só pra quem já está autenticado, não pra proteger ação de quem ainda
    # não está.
    def require_two_factor!
      return unless Current.admin
      return if Current.admin.otp_required_for_login?

      redirect_to new_admin_two_factor_path, alert: I18n.t("admin.two_factors.required")
    end
  end
end
