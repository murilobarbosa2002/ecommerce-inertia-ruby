class Role < ApplicationRecord
  has_many :role_permissions, dependent: :destroy
  has_many :permissions, through: :role_permissions
  # Impede apagar uma role ainda atribuída a algum admin — admin.role é
  # obrigatório (belongs_to padrão do Rails), não há "role vazia" pra cair.
  has_many :admins, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true, length: { maximum: 100 }

  def permission?(key)
    permissions.exists?(key: key.to_s)
  end
end
