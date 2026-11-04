class Admin < ApplicationRecord
  has_secure_password
  has_many :admin_sessions, dependent: :destroy

  normalizes :email_address, with: ->(email_address) { email_address.strip.downcase }

  # RFC 5321 limita endereço de e-mail a 254 caracteres — sem isso, não há
  # limite nenhum na coluna (Postgres :string não impõe tamanho máximo por
  # padrão, diferente de MySQL varchar).
  validates :email_address, presence: true, uniqueness: true, length: { maximum: 254 }
end
