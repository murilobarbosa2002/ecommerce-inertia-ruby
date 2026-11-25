module AdminPanel
  class AuditEventsController < AdminPanel::BaseController
    require_permission :view_audit_log

    def index
      result = AuditEvents::Search.call(
        query: params[:audit_events_search],
        event_types: audit_events_event_types_param,
        performed_by_admin_ids: audit_events_actor_ids_param,
        from: audit_events_date_param(:audit_events_from),
        to: audit_events_date_param(:audit_events_to),
        sort: params[:audit_events_sort],
        direction: params[:audit_events_direction],
        page: params[:audit_events_page]
      )

      render inertia: "Admin/AuditEvents/Index", props: {
        audit_events: {
          records: result.events.map { |event| audit_event_json(event) },
          page: result.page,
          total_pages: result.total_pages,
          total_count: result.total_count
        },
        actors: actors_json
      }
    end

    private

    def audit_event_json(event)
      {
        id: event.id,
        event_type: event.event_type,
        happened_at: event.created_at.iso8601,
        admin_email: event.admin&.email_address,
        performed_by_admin_email: event.performed_by_admin&.email_address,
        performed_by_admin_role_name: event.performed_by_admin&.role&.name,
        # Só exposto pra quem não tem usuário identificado (ex. login_failed
        # com e-mail inexistente) — a coluna "Usuário" da tela usa isso como
        # fallback, pra não ficar só "—" num login que nem chegou a existir
        # um Admin pra apontar.
        ip_address: event.performed_by_admin ? nil : event.ip_address&.to_s,
        metadata: event.metadata
      }
    end

    def actors_json
      Admin.order(:email_address).map { |admin| { id: admin.id, email_address: admin.email_address } }
    end

    # Mesmo racional de activity_event_types_param em DashboardsController:
    # string separada por vírgula, não array — qs (serializador de query
    # string do Inertia) descarta chave cujo valor seja um array vazio,
    # indistinguível de "nenhum filtro aplicado ainda".
    def audit_events_event_types_param
      return nil unless params.key?(:audit_events_event_types)

      params[:audit_events_event_types].to_s.split(",")
    end

    def audit_events_actor_ids_param
      params[:audit_events_actor_ids].to_s.split(",")
    end

    def audit_events_date_param(key)
      Time.zone.parse(params[key]) if params[key].present?
    rescue ArgumentError, TypeError
      nil
    end
  end
end
