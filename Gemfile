source "https://rubygems.org"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.1.4"
# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"
# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ windows jruby ]

# Use the database-backed adapters for Rails.cache, Active Job, and Action Cable
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Deploy this application anywhere as a Docker container [https://kamal-deploy.org]
gem "kamal", require: false

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem "image_processing", "~> 2.2"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"

  # Audits gems for known security defects (use config/bundler-audit.yml to ignore issues)
  gem "bundler-audit", require: false

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false

  # Test framework [https://github.com/rspec/rspec-rails]
  gem "rspec-rails", "~> 8.0"

  # Test data factories [https://github.com/thoughtbot/factory_bot_rails]
  gem "factory_bot_rails"

  # Fake data for factories [https://github.com/faker-ruby/faker]
  gem "faker"
end

group :test do
  # One-liner matchers for common Rails functionality [https://github.com/thoughtbot/shoulda-matchers]
  gem "shoulda-matchers"

  # System specs driving a real (headless) browser [https://github.com/teamcapybara/capybara]
  gem "capybara"

  # Pure Ruby Capybara driver via Chrome DevTools Protocol [https://github.com/rubycdp/cuprite]
  gem "cuprite"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # MCP server para debugging via agente de IA — Ruby eval, SQL, logs, introspecção
  # de models. Expõe HTTP local em /tidewave/mcp; nunca carregado fora de :development
  # (ver docs/adr/0011-tidewave-mcp-for-debugging.md).
  gem "tidewave"
end

# Traduções oficiais do framework (ActiveRecord/ActiveModel/data/hora) pra pt-BR
# e outros locales não inclusos no Rails por padrão [https://github.com/svenfuchs/rails-i18n]
gem "rails-i18n", "~> 8.1"

gem "inertia_rails", "~> 3.23"

gem "vite_rails", "~> 3.11"
