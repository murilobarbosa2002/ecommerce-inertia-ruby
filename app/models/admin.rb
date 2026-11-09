class Admin < ApplicationRecord
  include ChangeReasonRequired
  tracked_by_change_reason :email_address, :role_id

  has_secure_password
  belongs_to :role
  has_many :admin_sessions, dependent: :destroy
  has_many :admin_recovery_codes, dependent: :destroy

  # Dado sensível em repouso (docs/adr/0010) — exige
  # bin/rails db:encryption:init já executado (docs/environment-setup.md).
  encrypts :otp_secret

  normalizes :email_address, with: ->(email_address) { email_address.strip.downcase }

  # RFC 5321 limita endereço de e-mail a 254 caracteres — sem isso, não há
  # limite nenhum na coluna (Postgres :string não impõe tamanho máximo por
  # padrão, diferente de MySQL varchar).
  validates :email_address, presence: true, uniqueness: true, length: { maximum: 254 }
end
