class AddQuickActionKeysToAdmins < ActiveRecord::Migration[8.1]
  def change
    # Preferência pessoal (quais atalhos aparecem no dashboard do próprio
    # admin), não um dado de permissão — filtrado pelas permissões atuais
    # na exibição (app/frontend/config/quickActions.ts), nunca validado
    # contra um catálogo no backend. default [] vira "nenhuma escolha
    # feita ainda", interpretado pelo frontend como "mostra todas as
    # permitidas".
    add_column :admins, :quick_action_keys, :string, array: true, default: [], null: false
  end
end
