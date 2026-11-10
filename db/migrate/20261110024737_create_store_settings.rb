class CreateStoreSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :store_settings do |t|
      t.string :name, limit: 100, null: false, default: ""
      # Garante no banco (não só na aplicação) que só existe uma linha —
      # sem depender de id previsível/condição de corrida: índice único
      # numa coluna que é sempre true faz o Postgres rejeitar a segunda
      # linha, não importa o que mais ela tenha.
      t.boolean :singleton_guard, null: false, default: true

      t.timestamps
    end
    add_index :store_settings, :singleton_guard, unique: true
  end
end
