module AuditEvents
  class RecordAuditEvent
    def self.call(...)
      new(...).call
    end

    def initialize(event_type:, request: nil, admin: nil, performed_by_admin: Current.admin, metadata: {})
      @event_type = event_type
      @request = request
      @admin = admin
      # Current.admin por padrão, não hardcoded — igual ao whodunnit do
      # PaperTrail (BaseController#user_for_paper_trail), pra nunca
      # depender de um call site lembrar de passar isso manualmente. Numa
      # ação de auto-serviço, Current.admin é o mesmo registro que admin:,
      # então os dois campos naturalmente coincidem; numa ação sobre outro
      # admin (ex. resetar o 2FA de alguém), Current.admin é quem agiu,
      # distinto de admin: (o alvo). Em contexto sem request (rake task),
      # Current.admin é nil — correto, não existe ator autenticado.
      #
      # O parâmetro existe pra um caso que Current.admin não cobre: um
      # evento de auto-serviço registrado ANTES de existir uma AdminSession
      # (ex. password_verified/account_unlocked, no meio do login — nem
      # toda etapa do fluxo de autenticação já tem sessão criada). Nesses
      # casos o call site já sabe quem é o admin (é o mesmo passado em
      # admin:) mesmo sem Current.admin estar disponível ainda — achado
      # real, bug: performed_by_admin ficava sempre nil nesses dois
      # eventos, mesmo sendo auto-serviço (docs/bugs/audit-logging.md).
      @performed_by_admin = performed_by_admin
      @metadata = metadata
    end

    def call
      AuditEvent.create!(
        event_type: @event_type,
        admin: @admin,
        performed_by_admin: @performed_by_admin,
        ip_address: @request&.remote_ip,
        user_agent: @request&.user_agent,
        metadata: @metadata
      )
    end
  end
end
