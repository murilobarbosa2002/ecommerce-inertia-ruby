class AddTwoFactorFieldsToAdmins < ActiveRecord::Migration[8.1]
  def change
    add_column :admins, :otp_secret, :string
    add_column :admins, :otp_required_for_login, :boolean, null: false, default: false
    # Guarda o timestamp do último código TOTP aceito (ROTP::TOTP#verify
    # retorna isso) — passado de volta via `after:` na próxima verificação,
    # pra impedir reuso do mesmo código dentro da mesma janela de 30s.
    add_column :admins, :last_otp_at, :datetime
  end
end
