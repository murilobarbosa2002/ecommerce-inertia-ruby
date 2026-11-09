module AdminPanel
  module RequireTwoFactor
    extend ActiveSupport::Concern

    included do
      before_action :require_two_factor_for_mutation
    end

    private

    # Só bloqueia mutação (POST/PATCH/PUT/DELETE) de um admin já autenticado
    # — GET/HEAD continuam liberados sempre, senão nem o dashboard renderiza
    # pra mostrar o aviso de 2FA obrigatório (docs/adr/0023). `request.get?`
    # sozinho é `false` pra HEAD (Brakeman: VerbConfusion), mesmo o Rails
    # roteando HEAD igual a GET — sem o `request.head?` aqui, uma requisição
    # HEAD numa página de visualização seria tratada como mutação.
    # `Current.admin` nulo (login, reset de senha, verificação de 2FA no
    # login — nenhum desses exige sessão) não passa por aqui: essa regra é
    # só pra quem já está autenticado, não pra proteger ação de quem ainda
    # não está.
    def require_two_factor_for_mutation
      return if request.get? || request.head?
      return unless Current.admin
      return if Current.admin.otp_required_for_login?

      redirect_to root_path, alert: I18n.t("admin.two_factors.required")
    end
  end
end
