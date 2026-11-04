class Admin < ApplicationRecord
  has_secure_password
  has_many :admin_sessions, dependent: :destroy

  normalizes :email_address, with: ->(email_address) { email_address.strip.downcase }

  validates :email_address, presence: true, uniqueness: true
end
