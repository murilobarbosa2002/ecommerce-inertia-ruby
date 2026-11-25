module Admins
  class Search
    DEFAULT_PER_PAGE = 20

    # Mapeia a chave de ordenação (vinda da DataTable, frontend) pra uma
    # expressão SQL confiável — nunca o nome da coluna vindo direto de
    # params (docs/adr/0010, query sempre parametrizada). direction é
    # restrito a "asc"/"desc" no initialize, então a interpolação abaixo
    # nunca carrega valor de usuário sem passar por um whitelist antes.
    SORT_COLUMNS = {
      "name" => %w[admins.first_name admins.last_name],
      "email_address" => %w[admins.email_address],
      "role_name" => %w[roles.name]
    }.freeze

    Result = Struct.new(:admins, :page, :per_page, :total_count, :total_pages, keyword_init: true)

    def self.call(...)
      new(...).call
    end

    def initialize(query: nil, sort: nil, direction: nil, page: 1, per_page: DEFAULT_PER_PAGE)
      @query = query.presence
      @sort_column = SORT_COLUMNS.key?(sort) ? sort : "name"
      @direction = direction == "desc" ? "DESC" : "ASC"
      @page = [ page.to_i, 1 ].max
      @per_page = per_page
    end

    def call
      scope = Admin.includes(:role).joins(:role)
      scope = apply_query(scope)
      order_clause = SORT_COLUMNS.fetch(@sort_column).map { |column| "#{column} #{@direction}" }.join(", ")
      scope = scope.order(Arel.sql(order_clause))

      total_count = scope.count
      admins = scope.limit(@per_page).offset((@page - 1) * @per_page)

      Result.new(
        admins: admins,
        page: @page,
        per_page: @per_page,
        total_count: total_count,
        total_pages: total_count.zero? ? 1 : (total_count.to_f / @per_page).ceil
      )
    end

    private

    def apply_query(scope)
      return scope unless @query

      pattern = "%#{ActiveRecord::Base.sanitize_sql_like(@query)}%"
      scope.where(
        "admins.first_name ILIKE :pattern OR admins.last_name ILIKE :pattern " \
        "OR admins.email_address ILIKE :pattern OR roles.name ILIKE :pattern",
        pattern: pattern
      )
    end
  end
end
