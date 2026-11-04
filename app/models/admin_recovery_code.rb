class AdminRecoveryCode < ApplicationRecord
  belongs_to :admin

  validates :code_digest, presence: true, uniqueness: true

  scope :unused, -> { where(used_at: nil) }
end
