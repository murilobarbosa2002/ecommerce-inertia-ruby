class CreateRoles < ActiveRecord::Migration[8.1]
  def change
    create_table :roles do |t|
      # :string do Postgres não tem limite de tamanho por padrão (ver
      # CONTRIBUTING.md, "Padrões de código") — limite explícito.
      t.string :name, null: false, limit: 100

      t.timestamps
    end
    add_index :roles, :name, unique: true
  end
end
