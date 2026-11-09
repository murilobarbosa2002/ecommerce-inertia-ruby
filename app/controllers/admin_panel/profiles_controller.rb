module AdminPanel
  class ProfilesController < AdminPanel::BaseController
    # Trocar a senha não devia depender de ter 2FA ativo (docs/adr/0023) —
    # senão um admin sem 2FA que esqueceu/precisa trocar a senha ficaria
    # travado sem conseguir fazer a única coisa que resolveria isso.
    skip_before_action :require_two_factor_for_mutation, only: :update

    def show
      render inertia: "Admin/Profile/Show", props: {
        two_factor_enabled: Current.admin.otp_required_for_login?
      }
    end

    def update
      admin = Current.admin

      unless admin.authenticate(params[:current_password])
        AuditEvents::RecordAuditEvent.call(admin: admin, request: request, event_type: :reauthentication_failed)
        return redirect_to admin_profile_path, alert: I18n.t("admin.profiles.update.invalid_current_password")
      end

      # has_secure_password só valida presença de senha na criação, não na
      # atualização (checa password_digest, que continua presente mesmo com
      # password: "" — a senha antiga nunca é sobrescrita por um valor em
      # branco) — sem essa guarda, um password em branco "passaria" sem
      # trocar nada de fato, e ainda assim destruiria todas as sessões e
      # reportaria sucesso.
      if params[:password].blank?
        return redirect_to admin_profile_path, alert: I18n.t("admin.profiles.update.blank_password")
      end

      if admin.update(params.permit(:password, :password_confirmation))
        # Mesmo padrão já usado em PasswordsController#update (fluxo por
        # token) — qualquer sessão ativa da conta, incluindo a atual, é
        # invalidada; faz login de novo com a senha nova.
        admin.admin_sessions.destroy_all
        AuditEvents::RecordAuditEvent.call(admin: admin, request: request, event_type: :password_changed)
        redirect_to new_admin_session_path, notice: I18n.t("admin.profiles.update.success")
      else
        redirect_to admin_profile_path, alert: admin.errors.full_messages.to_sentence
      end
    end
  end
end
