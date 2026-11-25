module AdminPanel
  module Authentication
    extend ActiveSupport::Concern

    # Sem "lembrar de mim": sessão expira num prazo curto, fixo a partir do
    # login (não desliza com o uso) — pensado pra quem loga num dispositivo
    # que não é só seu. Com "lembrar de mim": prazo bem mais longo, mas
    # nunca permanente de verdade (era `cookies.signed.permanent`, sem
    # nenhuma expiração, até esta mudança).
    DEFAULT_SESSION_DURATION = 24.hours
    REMEMBERED_SESSION_DURATION = 30.days

    included do
      before_action :require_admin_authentication
      helper_method :admin_authenticated?
    end

    class_methods do
      def allow_unauthenticated_admin_access(**options)
        skip_before_action :require_admin_authentication, **options
      end
    end

    private

    def admin_authenticated?
      resume_admin_session
    end

    def require_admin_authentication
      resume_admin_session || request_admin_authentication
    end

    def resume_admin_session
      Current.admin_session ||= find_admin_session_by_cookie
    end

    def find_admin_session_by_cookie
      return unless cookies.signed[:admin_session_id]

      admin_session = AdminSession.find_by(id: cookies.signed[:admin_session_id])
      return unless admin_session

      if admin_session.expires_at.past?
        admin_session.destroy
        cookies.delete(:admin_session_id)
        return
      end

      admin_session
    end

    def request_admin_authentication
      session[:admin_return_to_after_authenticating] = request.url
      redirect_to new_admin_session_path
    end

    def after_admin_authentication_url
      # root_url é o dashboard do painel (AdminPanel::DashboardsController,
      # config/routes.rb) — destino real desde que o painel mínimo existe.
      session.delete(:admin_return_to_after_authenticating) || root_url
    end

    def start_new_admin_session_for(admin, remember_me: false)
      duration = remember_me ? REMEMBERED_SESSION_DURATION : DEFAULT_SESSION_DURATION
      expires_at = duration.from_now

      admin.admin_sessions.create!(
        user_agent: request.user_agent,
        ip_address: request.remote_ip,
        expires_at: expires_at
      ).tap do |admin_session|
        Current.admin_session = admin_session
        cookies.signed[:admin_session_id] = { value: admin_session.id, expires: expires_at, httponly: true, same_site: :lax }
      end
    end

    def terminate_admin_session
      Current.admin_session.destroy
      cookies.delete(:admin_session_id)
    end
  end
end
