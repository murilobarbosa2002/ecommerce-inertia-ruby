class AddExpiresAtToAdminSessions < ActiveRecord::Migration[8.1]
  def up
    add_column :admin_sessions, :expires_at, :datetime

    # Backfill pras sessões já existentes (criadas quando a sessão era
    # permanente, sem expiração) — 24h a partir de agora, o mesmo prazo
    # padrão de uma sessão nova sem "lembrar de mim", em vez de invalidar
    # todo mundo na hora que esta migration rodar.
    AdminSession.reset_column_information
    AdminSession.where(expires_at: nil).update_all(expires_at: 24.hours.from_now)

    change_column_null :admin_sessions, :expires_at, false
  end

  def down
    remove_column :admin_sessions, :expires_at
  end
end
