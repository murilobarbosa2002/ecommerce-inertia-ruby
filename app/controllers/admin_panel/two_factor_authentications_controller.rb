module AdminPanel
  class TwoFactorAuthenticationsController < AdminPanel::BaseController
    allow_unauthenticated_admin_access
    before_action :set_pending_admin

    def new
      # PENDING-FRONTEND: página Inertia ainda não existe (PR7).
      render inertia: "Admin/TwoFactorAuthentication/New"
    end

    def create
      result = AdminAuthentication::CompleteTwoFactorLogin.call(admin: @admin, code: params[:otp_code], request: request)

      if result
        session.delete(:pending_admin_id)
        session.delete(:pending_admin_expires_at)
        start_new_admin_session_for(@admin)
        event_type = result == :recovery_code ? :recovery_code_used : :two_factor_verified
        AuditEvents::RecordAuditEvent.call(event_type: event_type, admin: @admin, request: request)
        # login_succeeded é o marcador único de "uma AdminSession de verdade
        # foi criada", disparado tanto aqui (login com 2FA) quanto no fluxo
        # sem 2FA (SessionsController#create) — nunca no passo de senha
        # sozinho (ver AuthenticateWithPassword#record_success).
        AuditEvents::RecordAuditEvent.call(event_type: :login_succeeded, admin: @admin, request: request)
        redirect_to after_admin_authentication_url
      else
        redirect_to new_admin_two_factor_authentication_path, alert: I18n.t("admin.two_factor_authentications.create.invalid_code")
      end
    end

    private

    def set_pending_admin
      admin_id = session[:pending_admin_id]
      expires_at = session[:pending_admin_expires_at]

      if admin_id.blank? || expires_at.blank? || Time.current > Time.zone.parse(expires_at)
        clear_pending_admin_session
        redirect_to new_admin_session_path, alert: I18n.t("admin.two_factor_authentications.expired")
        return
      end

      @admin = Admin.find_by(id: admin_id)

      unless @admin
        clear_pending_admin_session
        redirect_to new_admin_session_path, alert: I18n.t("admin.two_factor_authentications.expired")
      end
    end

    def clear_pending_admin_session
      session.delete(:pending_admin_id)
      session.delete(:pending_admin_expires_at)
    end
  end
end
