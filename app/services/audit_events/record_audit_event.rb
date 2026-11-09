module AuditEvents
  class RecordAuditEvent
    def self.call(...)
      new(...).call
    end

    def initialize(event_type:, request: nil, admin: nil, metadata: {})
      @event_type = event_type
      @request = request
      @admin = admin
      @metadata = metadata
    end

    def call
      AuditEvent.create!(
        event_type: @event_type,
        admin: @admin,
        # Current.admin, não um parâmetro — igual ao whodunnit do
        # PaperTrail (BaseController#user_for_paper_trail), pra nunca
        # depender de um call site lembrar de passar isso manualmente.
        # Numa ação de auto-serviço, Current.admin é o mesmo registro que
        # admin:, então os dois campos naturalmente coincidem; numa ação
        # sobre outro admin (ex. resetar o 2FA de alguém), Current.admin é
        # quem agiu, distinto de admin: (o alvo). Em contexto sem request
        # (rake task), Current.admin é nil — correto, não existe "ator"
        # autenticado nesse caso.
        performed_by_admin: Current.admin,
        ip_address: @request&.remote_ip,
        user_agent: @request&.user_agent,
        metadata: @metadata
      )
    end
  end
end
