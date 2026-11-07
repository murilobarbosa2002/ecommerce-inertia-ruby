# PaperTrail (docs/adr/0013) serializa as colunas `object`/`object_changes`
# em YAML por padrão. Rails >= 7 carrega essas colunas com `YAML.safe_load`
# — sem a lista de classes permitidas abaixo, qualquer `reify`/`previous_version`
# falha com `Psych::DisallowedClass` para atributos comuns (datetime vira
# ActiveSupport::TimeWithZone, por exemplo). Lista recomendada pela própria
# documentação do PaperTrail:
# https://github.com/paper-trail-gem/paper_trail/blob/master/doc/pt_13_yaml_safe_load.md
ActiveRecord.use_yaml_unsafe_load = false
ActiveRecord.yaml_column_permitted_classes = [
  ActiveRecord::Type::Time::Value,
  ActiveSupport::TimeWithZone,
  ActiveSupport::TimeZone,
  BigDecimal,
  Date,
  Symbol,
  Time
]
