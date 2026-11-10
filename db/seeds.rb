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

manage_roles = Permission.find_or_create_by!(key: "manage_roles") do |permission|
  permission.description = "Criar papéis e configurar quais permissões cada um tem"
end

owner_role = Role.find_or_create_by!(name: "owner") do |role|
  role.change_reason = "Seed inicial do RBAC"
end
owner_role.permissions << manage_admins unless owner_role.permissions.include?(manage_admins)
owner_role.permissions << manage_roles unless owner_role.permissions.include?(manage_roles)

# reset_two_factor existe (pra ser atribuível pela tela de papéis), mas
# nunca é atribuída a nenhum papel por padrão — nem ao "owner". Resetar o
# 2FA de outro admin é sensível o bastante pra exigir uma concessão
# deliberada através da tela de papéis (manage_roles), não um padrão
# automático de bootstrap.
Permission.find_or_create_by!(key: "reset_two_factor") do |permission|
  permission.description = "Resetar o 2FA de outro admin (fluxo de recuperação de conta)"
end

# manage_store_settings segue a mesma regra de reset_two_factor: existe
# (pra ser atribuível pela tela de papéis), mas nunca é atribuída a nenhum
# papel por padrão — informação de marca da loja (nome, logo) é sensível o
# bastante pra exigir concessão deliberada, nunca automática.
Permission.find_or_create_by!(key: "manage_store_settings") do |permission|
  permission.description = "Configurar o nome e o logo da loja"
end

# StoreSetting.instance também cria sozinho se faltar (fallback pra banco
# não seedado), mas seedar aqui garante a linha sem depender desse
# fallback em produção — mesmo racional do Role "owner" acima.
StoreSetting.instance
