class Role < ApplicationRecord
  include ChangeReasonRequired
  tracked_by_change_reason :name

  has_many :role_permissions, dependent: :destroy
  # dependent: :destroy aqui (não só em role_permissions acima) é o que
  # faz Rails chamar RolePermission#destroy (com callback do PaperTrail)
  # quando uma permissão é removida via permission_ids=/permissions= —
  # sem isso, o padrão do Rails pra has_many :through é um DELETE em lote
  # (scope.delete_all), que nunca passa por callback nenhum: revogar uma
  # permissão não deixava rastro de auditoria nenhum (nem quem, nem
  # quando, nem por quê — achado real investigando a cobertura de
  # auditoria desta mesma PR, antes do primeiro commit).
  has_many :permissions, through: :role_permissions, dependent: :destroy
  # Impede apagar uma role ainda atribuída a algum admin — admin.role é
  # obrigatório (belongs_to padrão do Rails), não há "role vazia" pra cair.
  has_many :admins, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true, length: { maximum: 100 }
  # tracked_by_change_reason só exige change_reason quando :name muda — mas
  # a parte mais sensível de um Role (quais permissões ele dá, ex.
  # manage_admins) não é um atributo rastreável pelo PaperTrail (é
  # has_many :through, não coluna). change_reason continua obrigatório
  # mesmo quando só a lista de permissões muda, sem renomear o papel.
  validates :change_reason, presence: true, length: { maximum: ChangeReasonRequired::MAX_LENGTH }, on: :update

  def permission?(key)
    permissions.exists?(key: key.to_s)
  end
end
