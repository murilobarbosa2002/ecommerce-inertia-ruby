module AdminPanel
  module Authorization
    extend ActiveSupport::Concern

    class_methods do
      # Uso: require_permission(:manage_admins) no topo do controller.
      def require_permission(permission, **options)
        before_action(**options) { require_admin_permission(permission) }
      end
    end

    private

    def require_admin_permission(permission)
      return if Current.admin&.role&.permission?(permission)

      redirect_to root_path, alert: I18n.t("admin.authorization.forbidden")
    end
  end
end
