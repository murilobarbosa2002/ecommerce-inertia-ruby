# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Role/permissão mínima pro RBAC funcionar em qualquer ambiente (docs/adr/0021)
# — Admin#role é obrigatório, então isso precisa existir antes do primeiro
# admin:create. Repetido aqui (não só na migration AddRoleToAdmins) porque
# db:schema:load/db:setup (o caminho normal pra bootstrapar um banco novo:
# clone local, CI, primeiro deploy) carrega o schema.rb direto, sem
# re-executar o histórico de migrations — sem isso, um banco criado assim
# nunca teria a role "owner", só um banco que passou pelo db:migrate
# completo desde o início.
manage_admins = Permission.find_or_create_by!(key: "manage_admins") do |permission|
  permission.description = "Criar, listar e editar outros admins"
end

owner_role = Role.find_or_create_by!(name: "owner")
owner_role.permissions << manage_admins unless owner_role.permissions.include?(manage_admins)
