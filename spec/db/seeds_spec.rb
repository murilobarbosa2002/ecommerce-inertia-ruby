require "rails_helper"

# Regressão real (docs/bugs/infrastructure.md): a role "owner" só existia
# dentro de uma migration — um banco criado via db:schema:load/db:setup (o
# caminho normal pra bootstrapar um ambiente novo) nunca a teria, porque
# não reexecuta o histórico de migrations. Nada rodava db/seeds.rb antes
# deste spec, então essa regressão não seria pega pela suíte.
RSpec.describe "db/seeds.rb" do
  it "cria a role owner com as permissões manage_admins/manage_roles, de forma idempotente" do
    load Rails.root.join("db/seeds.rb")

    owner_role = Role.find_by(name: "owner")
    expect(owner_role).to be_present
    expect(owner_role.permission?("manage_admins")).to be true
    expect(owner_role.permission?("manage_roles")).to be true

    expect { load Rails.root.join("db/seeds.rb") }
      .not_to change(Role, :count)
    expect { load Rails.root.join("db/seeds.rb") }
      .not_to change(Permission, :count)
  end

  it "cria as permissões reset_two_factor e view_audit_log, atribuídas ao owner por padrão" do
    load Rails.root.join("db/seeds.rb")

    expect(Permission.find_by(key: "reset_two_factor")).to be_present
    expect(Permission.find_by(key: "view_audit_log")).to be_present
    owner_role = Role.find_by(name: "owner")
    expect(owner_role.permission?("reset_two_factor")).to be true
    expect(owner_role.permission?("view_audit_log")).to be true

    expect { load Rails.root.join("db/seeds.rb") }
      .not_to change(Role.find_by(name: "owner").permissions, :count)
  end

  it "cria manage_store_settings/delete_admin e a linha única de StoreSetting" do
    load Rails.root.join("db/seeds.rb")

    expect(Permission.find_by(key: "manage_store_settings")).to be_present
    expect(Permission.find_by(key: "delete_admin")).to be_present
    expect(StoreSetting.count).to eq(1)

    expect { load Rails.root.join("db/seeds.rb") }
      .not_to change(StoreSetting, :count)
  end

  # docs/adr/0042: owner é o papel de maior confiança do sistema e sempre
  # tem toda permissão existente, automaticamente — nunca depende de
  # concessão manual nem de o seed conhecer essa permissão pelo nome.
  it "owner sempre tem toda permissão existente, inclusive uma criada depois que o seed já rodou antes" do
    load Rails.root.join("db/seeds.rb")
    owner_role = Role.find_by(name: "owner")
    expect(owner_role.permissions.pluck(:key)).to match_array(Permission.pluck(:key))

    # Simula uma permissão nova que uma feature futura cria (ex. numa
    # migration) antes do seed.rb ser atualizado pra mencioná-la pelo
    # nome — o Permission.find_each no fim do seed precisa pegar essa
    # permissão só por ela existir no banco, não por estar listada aqui.
    nova_permissao = Permission.create!(key: "permissao_futura_inventada", description: "Teste")

    load Rails.root.join("db/seeds.rb")

    expect(owner_role.reload.permission?(nova_permissao.key)).to be true
  end
end
