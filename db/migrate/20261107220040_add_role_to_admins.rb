class AddRoleToAdmins < ActiveRecord::Migration[8.1]
  class MigrationRole < ApplicationRecord
    self.table_name = "roles"
  end

  class MigrationPermission < ApplicationRecord
    self.table_name = "permissions"
  end

  class MigrationRolePermission < ApplicationRecord
    self.table_name = "role_permissions"
  end

  class MigrationAdmin < ApplicationRecord
    self.table_name = "admins"
  end

  def up
    add_reference :admins, :role, null: true, foreign_key: true

    # Seed mínimo pra não deixar nenhum admin existente sem role (a coluna
    # vira not null logo abaixo) — "owner" com a única permissão que o
    # painel já usa até agora (docs/adr/0021).
    manage_admins = MigrationPermission.create!(
      key: "manage_admins",
      description: "Criar, listar e editar outros admins"
    )
    owner_role = MigrationRole.create!(name: "owner")
    MigrationRolePermission.create!(role_id: owner_role.id, permission_id: manage_admins.id)

    MigrationAdmin.update_all(role_id: owner_role.id)

    change_column_null :admins, :role_id, false
  end

  def down
    remove_reference :admins, :role, foreign_key: true
    MigrationRolePermission.delete_all
    MigrationPermission.delete_all
    MigrationRole.delete_all
  end
end
