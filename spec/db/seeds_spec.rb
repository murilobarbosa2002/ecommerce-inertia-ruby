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

  it "cria a permissão reset_two_factor sem atribuí-la a nenhum papel por padrão" do
    load Rails.root.join("db/seeds.rb")

    expect(Permission.find_by(key: "reset_two_factor")).to be_present
    expect(Role.find_by(name: "owner").permission?("reset_two_factor")).to be false
  end
end
