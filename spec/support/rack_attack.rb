require "rack/attack"

# config/environments/test.rb usa config.cache_store = :null_store. Rack::Attack
# usa Rails.cache por padrão (sem override) — nesse ambiente, qualquer throttle
# é um no-op silencioso: um teste de rate limit passaria mesmo se o throttle
# fosse removido. MemoryStore novo a cada request spec garante throttle de
# verdade, isolado entre examples.
RSpec.configure do |config|
  config.before(:each, type: :request) do
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
  end
end
