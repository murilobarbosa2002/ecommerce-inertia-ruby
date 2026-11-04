class CreateAuditEvents < ActiveRecord::Migration[8.1]
  def change
    # Log de auditoria é append-only (nunca atualizado) — por isso só
    # created_at, sem updated_at (ver docs/adr/0013).
    create_table :audit_events do |t|
      t.integer :event_type, null: false
      t.references :admin, null: true, foreign_key: true
      t.inet :ip_address
      t.string :user_agent
      t.jsonb :metadata, null: false, default: {}

      t.datetime :created_at, null: false
    end

    add_index :audit_events, :event_type
  end
end
