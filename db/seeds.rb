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
Permission.find_or_create_by!(key: "manage_admins") do |permission|
  permission.description = "Criar, listar e editar outros admins"
end

Permission.find_or_create_by!(key: "manage_roles") do |permission|
  permission.description = "Criar papéis e configurar quais permissões cada um tem"
end

owner_role = Role.find_or_create_by!(name: "owner") do |role|
  role.change_reason = "Seed inicial do RBAC"
end

# reset_two_factor existe pra ser atribuível pela tela de papéis a
# qualquer papel — resetar o 2FA de outro admin é o fluxo de recuperação
# de conta.
Permission.find_or_create_by!(key: "reset_two_factor") do |permission|
  permission.description = "Resetar o 2FA de outro admin (fluxo de recuperação de conta)"
end

# view_audit_log dá acesso ao feed de atividade recente (eventos de
# segurança) no dashboard.
Permission.find_or_create_by!(key: "view_audit_log") do |permission|
  permission.description = "Ver o feed de atividade recente (eventos de segurança) no dashboard"
end

Permission.find_or_create_by!(key: "manage_store_settings") do |permission|
  permission.description = "Configurar o nome e o logo da loja"
end

# delete_admin é a ação mais destrutiva/irreversível da tela de gerenciar
# admins — separada de propósito de manage_admins (quem pode criar/editar
# não necessariamente pode excluir).
Permission.find_or_create_by!(key: "delete_admin") do |permission|
  permission.description = "Excluir a conta de outro admin"
end

# Owner é o papel de maior confiança do sistema e sempre tem toda
# permissão existente, automaticamente — nunca depende de concessão
# manual pela tela de papéis, nem quando uma permissão nova é criada
# (docs/adr/0042). Fica no fim do arquivo de propósito: só depois que
# toda Permission já foi criada acima (manage_admins/manage_roles
# inclusos) é que dá pra garantir "toda", sem depender da ordem em que
# uma permissão nova é adicionada a este arquivo no futuro.
Permission.find_each do |permission|
  owner_role.permissions << permission unless owner_role.permissions.include?(permission)
end

# StoreSetting.instance também cria sozinho se faltar (fallback pra banco
# não seedado), mas seedar aqui garante a linha sem depender desse
# fallback em produção — mesmo racional do Role "owner" acima.
StoreSetting.instance
