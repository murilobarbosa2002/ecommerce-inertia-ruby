module AuditEvents
  class Search
    # Menor que o padrão de Admins::Search/Roles::Search (20) — log de
    # auditoria tende a crescer muito mais rápido que admin/papel (um
    # evento por ação, não por registro criado), então uma página menor
    # mantém a tabela mais enxuta de ler por padrão.
    DEFAULT_PER_PAGE = 10

    # Só "happened_at" (created_at) é ordenável por enquanto — é a única
    # coluna que a tela mostra como cabeçalho clicável (as outras são
    # derivadas/compostas: tipo+ícone, descrição montada, e-mail do ator).
    SORT_COLUMNS = {
      "happened_at" => %w[audit_events.created_at]
    }.freeze

    Result = Struct.new(:events, :page, :per_page, :total_count, :total_pages, keyword_init: true)

    def self.call(...)
      new(...).call
    end

    def initialize(
      query: nil, event_types: nil, performed_by_admin_ids: nil, from: nil, to: nil,
      sort: nil, direction: nil, page: 1, per_page: DEFAULT_PER_PAGE
    )
      @query = query.presence
      # nil (parâmetro nunca enviado) é "todos os tipos"; [] (enviado, mas
      # vazio) é uma escolha explícita de "nenhum" — mesmo racional de
      # AuditEvents::RecentActivity. `&` restringe ao enum real mesmo
      # quando não-nil, já que event_types vem de params de query string.
      all_event_types = AuditEvent.event_types.keys
      @event_types = event_types.nil? ? all_event_types : (Array(event_types) & all_event_types)
      # Nenhum usuário selecionado = sem filtro (mostra todos) — diferente
      # de event_types, aqui não existe uma escolha explícita de "nenhum".
      @performed_by_admin_ids = Array(performed_by_admin_ids).presence
      @from = from
      @to = to
      @sort_column = SORT_COLUMNS.key?(sort) ? sort : "happened_at"
      @direction = direction == "asc" ? "ASC" : "DESC"
      @page = [ page.to_i, 1 ].max
      @per_page = per_page
    end

    def call
      scope = AuditEvent.where(event_type: @event_types).includes(:admin, performed_by_admin: :role)
      scope = apply_query(scope)
      scope = scope.where(performed_by_admin_id: @performed_by_admin_ids) if @performed_by_admin_ids
      scope = scope.where(created_at: @from..) if @from
      scope = scope.where(created_at: ..@to) if @to
      order_clause = SORT_COLUMNS.fetch(@sort_column).map { |column| "#{column} #{@direction}" }.join(", ")
      scope = scope.order(Arel.sql(order_clause))

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

    private

    # Dois joins explícitos (apelidados), não .joins(:admin, :performed_by_admin)
    # direto: as duas associações apontam pra mesma tabela (admins), e
    # depender do apelido que o Rails gera sozinho pra evitar colisão de
    # nome seria implícito demais pra uma condição de WHERE escrita à mão.
    def apply_query(scope)
      return scope unless @query

      pattern = "%#{ActiveRecord::Base.sanitize_sql_like(@query)}%"
      scope
        .joins(
          "LEFT JOIN admins AS subject_admins ON subject_admins.id = audit_events.admin_id " \
          "LEFT JOIN admins AS actor_admins ON actor_admins.id = audit_events.performed_by_admin_id"
        )
        .where(
          "subject_admins.email_address ILIKE :pattern OR actor_admins.email_address ILIKE :pattern",
          pattern: pattern
        )
    end
  end
end
