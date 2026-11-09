class RolePermission < ApplicationRecord
  # Rastreia criação/exclusão (qual permissão foi dada/tirada de qual papel,
  # quando, por quem) — essa é a parte mais sensível de um Role (ex. quem
  # ganhou `manage_admins`), por isso tem histórico próprio, não só o nome
  # do papel. `change_reason` não é um atributo próprio: lê direto de
  # `role.change_reason` (o `belongs_to :role` resolve pro mesmo objeto em
  # memória que `Role#permission_ids=` está manipulando, via inverse_of
  # automático do Rails) — sem isso, o motivo digitado pelo admin era
  # validado como obrigatório e depois descartado, nunca gravado em
  # nenhuma versão (nem aqui, nem no Role pai, que só versiona quando
  # `name` muda).
  has_paper_trail meta: { change_reason: proc { |record| record.role.change_reason } }

  belongs_to :role
  belongs_to :permission

  validates :permission_id, uniqueness: { scope: :role_id }
end
