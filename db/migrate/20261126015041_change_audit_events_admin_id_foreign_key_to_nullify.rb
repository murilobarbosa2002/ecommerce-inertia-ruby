class ChangeAuditEventsAdminIdForeignKeyToNullify < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :audit_events, :admins
    add_foreign_key :audit_events, :admins, on_delete: :nullify
  end
end
