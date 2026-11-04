module AdminPanel
  class SessionsController < AdminPanel::BaseController
    allow_unauthenticated_admin_access only: %i[new create]

    def new
      render inertia: "Admin/Session/New"
    end

    def create
      admin = AdminAuthentication::AuthenticateWithPassword.call(
        email_address: params[:email_address],
        password: params[:password],
        request: request
      )

      if admin
        start_new_admin_session_for(admin)
        redirect_to after_admin_authentication_url
      else
        # PENDING-FRONTEND: este flash não chega na UI ainda — nenhum
        # controller compartilha `flash` com o Inertia. Ver docs/adr/0013,
        # seção "Pendências de backend".
        redirect_to new_admin_session_path, alert: I18n.t("admin.sessions.create.invalid_credentials")
      end
    end

    def destroy
      terminate_admin_session
      redirect_to new_admin_session_path, status: :see_other
    end
  end
end
