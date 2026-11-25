class Admin < ApplicationRecord
  include ChangeReasonRequired
  tracked_by_change_reason :email_address, :role_id, :first_name, :last_name, :phone

  # Celular brasileiro: DDD (2 dígitos) + 9 + 8 dígitos, só dígitos depois
  # da normalização abaixo.
  PHONE_FORMAT = /\A\d{2}9\d{8}\z/

  has_secure_password
  belongs_to :role
  has_many :admin_sessions, dependent: :destroy
  has_many :admin_recovery_codes, dependent: :destroy

  # Dado sensível em repouso (docs/adr/0010) — exige
  # bin/rails db:encryption:init já executado (docs/environment-setup.md).
  encrypts :otp_secret
  # Dado de contato (docs/adr/0010) — opcional, então sem o campo não há
  # nada a criptografar (encrypts já lida bem com valor nil).
  encrypts :phone

  # Conta "bloqueada" de verdade, não só com locked_at preenchido — o
  # bloqueio expira sozinho depois de LOCKOUT_DURATION, mas failed_login_attempts/
  # locked_at só são zerados no próximo login (AuthenticateWithPassword), então
  # locked_at.present? sozinho contaria também conta já destravada há tempo.
  scope :currently_locked, -> {
    where.not(locked_at: nil)
      .where(locked_at: AdminAuthentication::AuthenticateWithPassword::LOCKOUT_DURATION.ago..)
  }

  normalizes :email_address, with: ->(email_address) { email_address.strip.downcase }
  # Guarda só dígitos (remove DDD entre parênteses, hífen, espaço etc. que o
  # formulário aceitar) — a validação de formato abaixo já exige o formato
  # esperado, então o dado persistido fica sempre normalizado.
  normalizes :phone, with: ->(phone) { phone.present? ? phone.gsub(/\D/, "") : phone }

  # RFC 5321 limita endereço de e-mail a 254 caracteres — sem isso, não há
  # limite nenhum na coluna (Postgres :string não impõe tamanho máximo por
  # padrão, diferente de MySQL varchar).
  validates :email_address, presence: true, uniqueness: true, length: { maximum: 254 }
  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  # allow_blank: celular é opcional (nem todo admin precisa informar um).
  validates :phone, format: { with: PHONE_FORMAT }, allow_blank: true
end
