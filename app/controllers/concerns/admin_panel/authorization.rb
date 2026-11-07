module AdminPanel
  module Authorization
    extend ActiveSupport::Concern

    class_methods do
      # Uso: require_permission(:manage_admins) no topo do controller.
      # API exata (resposta de "sem permissão") ainda pode mudar quando o
      # painel (Fase 5, docs/adr/0021) ganhar uma tela de verdade pra
      # redirecionar — 403 puro é o mínimo correto por enquanto.
      def require_permission(permission, **options)
        before_action(**options) { require_admin_permission(permission) }
      end
    end

    private

    def require_admin_permission(permission)
      head :forbidden unless Current.admin&.role&.permission?(permission)
    end
  end
end
