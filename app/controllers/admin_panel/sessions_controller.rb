module AdminPanel
  class SessionsController < AdminPanel::BaseController
    allow_unauthenticated_admin_access only: %i[new create]
    # Sempre pode deslogar, com ou sem 2FA ativo (docs/adr/0023).
    skip_before_action :require_two_factor_for_mutation, only: :destroy

    def new
      render inertia: "Admin/Session/New"
    end

    def create
      admin = AdminAuthentication::AuthenticateWithPassword.call(
        email_address: params[:email_address],
        password: params[:password],
        request: request
      )

      if admin&.otp_required_for_login?
        # Estado "senha certa, 2FA pendente" fica na sessão assinada padrão
        # do Rails (nunca cria a AdminSession real até o código ser
        # confirmado) — expira em 5min, checado em TwoFactorAuthentications
        # Controller#set_pending_admin.
        session[:pending_admin_id] = admin.id
        session[:pending_admin_expires_at] = 5.minutes.from_now
        redirect_to new_admin_two_factor_authentication_path
      elsif admin
        start_new_admin_session_for(admin)
        AuditEvents::RecordAuditEvent.call(event_type: :login_succeeded, admin: admin, request: request)
        redirect_to after_admin_authentication_url
      else
        redirect_to new_admin_session_path, alert: I18n.t("admin.sessions.create.invalid_credentials")
      end
    end

    def destroy
      admin = Current.admin
      terminate_admin_session
      AuditEvents::RecordAuditEvent.call(event_type: :logout, admin: admin, request: request)
      redirect_to new_admin_session_path, status: :see_other
    end
  end
end
