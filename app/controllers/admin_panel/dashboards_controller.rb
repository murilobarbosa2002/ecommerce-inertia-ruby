module AdminPanel
  class DashboardsController < AdminPanel::BaseController
    def show
      render inertia: "Admin/Dashboard/Show", props: {
        stats: stats_json,
        activity: activity_json,
        quick_action_keys: Current.admin.quick_action_keys
      }
    end

    private

    def stats_json
      {
        total_admins: Admin.count,
        admins_without_two_factor: Admin.where(otp_required_for_login: false).count,
        locked_admins: Admin.currently_locked.count
      }
    end

    # nil (não um objeto vazio) quando o admin não tem view_audit_log —
    # distingue "sem permissão de ver" de "tem permissão, mas não há nada
    # pra mostrar ainda", pro frontend decidir se mostra o card vazio ou
    # nem o renderiza.
    def activity_json
      return unless Current.admin.role.permission?("view_audit_log")

      result = AuditEvents::RecentActivity.call(
        event_types: activity_event_types_param,
        from: activity_date_param(:activity_from),
        to: activity_date_param(:activity_to),
        page: params[:activity_page]
      )

      {
        events: result.events.map { |event| event_json(event) },
        page: result.page,
        per_page: result.per_page,
        total_count: result.total_count,
        total_pages: result.total_pages
      }
    end

    def event_json(event)
      {
        id: event.id,
        event_type: event.event_type,
        happened_at: event.created_at.iso8601,
        admin_email: event.admin&.email_address,
        performed_by_admin_email: event.performed_by_admin&.email_address,
        # Só login_failed usa isso hoje (admin pode ser nil quando o
        # e-mail digitado não corresponde a nenhuma conta — o e-mail
        # tentado fica só em metadata, nunca numa associação de verdade).
        # Repassado como está, o frontend decide o que exibir.
        metadata: event.metadata
      }
    end

    # String separada por vírgula (não array): o serializador de query
    # string que o Inertia usa pra GET (qs) descarta por padrão qualquer
    # chave cujo valor seja um array vazio — "desmarcar todos os tipos no
    # filtro" nunca chegaria nos params do Rails como [], só como a chave
    # inteira ausente, indistinguível de "nenhum filtro aplicado ainda".
    # Uma string vazia ainda é enviada (key=), diferente de um array vazio.
    def activity_event_types_param
      return nil unless params.key?(:activity_event_types)

      params[:activity_event_types].to_s.split(",")
    end

    def activity_date_param(key)
      Time.zone.parse(params[key]) if params[key].present?
    rescue ArgumentError, TypeError
      nil
    end
  end
end
