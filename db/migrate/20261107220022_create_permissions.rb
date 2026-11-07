class CreatePermissions < ActiveRecord::Migration[8.1]
  def change
    create_table :permissions do |t|
      # Chave estável referenciada no código (ex. require_permission(:manage_admins),
      # docs/adr/0021) — nunca o id numérico, que pode mudar entre ambientes.
      t.string :key, null: false, limit: 100
      t.string :description, null: false, limit: 500

      t.timestamps
    end
    add_index :permissions, :key, unique: true
  end
end
