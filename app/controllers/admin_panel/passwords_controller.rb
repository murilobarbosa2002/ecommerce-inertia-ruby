module AdminPanel
  class PasswordsController < AdminPanel::BaseController
    allow_unauthenticated_admin_access
    before_action :set_admin_by_token, only: %i[edit update]

    def new
      # PENDING-FRONTEND: página Inertia ainda não existe (PR7).
      render inertia: "Admin/Password/New"
    end

    def create
      email_address = params[:email_address].to_s.strip.downcase
      admin = Admin.find_by(email_address: email_address)

      if admin
        AdminPanel::PasswordsMailer.reset(admin).deliver_later
        AuditEvents::RecordAuditEvent.call(event_type: :password_reset_requested, admin: admin, request: request)
      else
        AuditEvents::RecordAuditEvent.call(
          event_type: :password_reset_requested, request: request, metadata: { email_address: email_address }
        )
      end

      redirect_to new_admin_session_path, notice: I18n.t("admin.passwords.create.instructions_sent")
    end

    def edit
      # PENDING-FRONTEND: página Inertia ainda não existe (PR7).
      render inertia: "Admin/Password/Edit", props: { token: params[:token] }
    end

    def update
      if @admin.update(params.permit(:password, :password_confirmation))
        # Provar posse do e-mail é pelo menos tão forte quanto a senha em si —
        # resetar a senha com sucesso também limpa um bloqueio de conta
        # (AdminAuthentication::RecordFailedLoginAttempt), senão a conta
        # continuaria bloqueada por até mais 15min mesmo após provar posse.
        was_locked = @admin.locked_at.present?
        AdminAuthentication::ResetFailedLoginAttempts.call(admin: @admin)
        @admin.admin_sessions.destroy_all
        AuditEvents::RecordAuditEvent.call(event_type: :account_unlocked, admin: @admin, request: request) if was_locked
        AuditEvents::RecordAuditEvent.call(event_type: :password_reset_completed, admin: @admin, request: request)
        redirect_to new_admin_session_path, notice: I18n.t("admin.passwords.update.success")
      else
        redirect_to edit_admin_password_path(params[:token]), alert: I18n.t("admin.passwords.update.failure")
      end
    end

    private

    def set_admin_by_token
      @admin = Admin.find_by_password_reset_token!(params[:token])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      redirect_to new_admin_password_path, alert: I18n.t("admin.passwords.edit.invalid_or_expired")
    end
  end
end
