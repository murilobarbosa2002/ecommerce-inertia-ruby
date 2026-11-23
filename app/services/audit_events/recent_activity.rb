module AuditEvents
  class RecentActivity
    # Só os tipos relevantes como sinal de segurança do dia a dia pro
    # dashboard — os passos intermediários de um fluxo (password_verified,
    # two_factor_verified, recovery_code_used, reauthentication_failed,
    # password_reset_requested/completed, password_changed, login
    # bem-sucedido sem incidente nenhum intermediário já cobre isso) são
    # ruído sem contexto de segurança adicional aqui.
    RELEVANT_EVENT_TYPES = %w[
      login_succeeded
      login_failed
      account_locked
      account_unlocked
      two_factor_reset_by_admin
      store_settings_updated
    ].freeze

    DEFAULT_PER_PAGE = 10

    Result = Struct.new(:events, :page, :per_page, :total_count, :total_pages, keyword_init: true)

    def self.call(...)
      new(...).call
    end

    def initialize(event_types: nil, from: nil, to: nil, page: 1, per_page: DEFAULT_PER_PAGE)
      # nil (parâmetro nunca enviado) é "todos os relevantes"; [] (enviado,
      # mas vazio) é uma escolha explícita de "nenhum" — os dois não podem
      # cair no mesmo fallback, senão desmarcar tudo no filtro volta a
      # mostrar tudo. `&` ainda restringe ao conjunto conhecido mesmo
      # quando não-nil, já que event_types vem de params de query string.
      @event_types = event_types.nil? ? RELEVANT_EVENT_TYPES : (Array(event_types) & RELEVANT_EVENT_TYPES)
      @from = from
      @to = to
      @page = [ page.to_i, 1 ].max
      @per_page = per_page
    end

    def call
      scope = AuditEvent.where(event_type: @event_types).includes(:admin, :performed_by_admin)
      scope = scope.where(created_at: @from..) if @from
      scope = scope.where(created_at: ..@to) if @to
      scope = scope.order(created_at: :desc)

      total_count = scope.count
      events = scope.limit(@per_page).offset((@page - 1) * @per_page)

      Result.new(
        events: events,
        page: @page,
        per_page: @per_page,
        total_count: total_count,
        total_pages: total_count.zero? ? 1 : (total_count.to_f / @per_page).ceil
      )
    end
  end
end
