module Roles
  class Search
    DEFAULT_PER_PAGE = 20

    SORT_COLUMNS = {
      "name" => %w[roles.name]
    }.freeze

    Result = Struct.new(:roles, :page, :per_page, :total_count, :total_pages, keyword_init: true)

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
      scope = Role.includes(:permissions)
      scope = apply_query(scope)
      order_clause = SORT_COLUMNS.fetch(@sort_column).map { |column| "#{column} #{@direction}" }.join(", ")
      scope = scope.order(Arel.sql(order_clause))

      total_count = scope.count
      roles = scope.limit(@per_page).offset((@page - 1) * @per_page)

      Result.new(
        roles: roles,
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
      scope.where("roles.name ILIKE :pattern", pattern: pattern)
    end
  end
end
