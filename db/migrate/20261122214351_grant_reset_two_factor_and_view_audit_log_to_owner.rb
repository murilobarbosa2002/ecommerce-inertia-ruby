# Mudança de produto (não um bug): reset_two_factor e a nova view_audit_log
# passam a vir no papel "owner" por padrão. db/seeds.rb já reflete esse
# estado final pra qualquer banco novo, mas db:seed não roda sozinho em
# todo deploy (é um passo manual de bootstrap) — sem esta migration, um
# banco já seedado antes desta mudança nunca ganharia a concessão
# retroativamente. find_or_create_by!/<< são idempotentes, então rodar
# esta migration depois de db/seeds.rb (ou vice-versa) não duplica nada.
class GrantResetTwoFactorAndViewAuditLogToOwner < ActiveRecord::Migration[8.1]
  def up
    owner_role = Role.find_by(name: "owner")
    return unless owner_role

    reset_two_factor = Permission.find_or_create_by!(key: "reset_two_factor") do |permission|
      permission.description = "Resetar o 2FA de outro admin (fluxo de recuperação de conta)"
    end
    view_audit_log = Permission.find_or_create_by!(key: "view_audit_log") do |permission|
      permission.description = "Ver o feed de atividade recente (eventos de segurança) no dashboard"
    end

    owner_role.permissions << reset_two_factor unless owner_role.permissions.include?(reset_two_factor)
    owner_role.permissions << view_audit_log unless owner_role.permissions.include?(view_audit_log)
  end

  def down
    owner_role = Role.find_by(name: "owner")
    return unless owner_role

    reset_two_factor = Permission.find_by(key: "reset_two_factor")
    view_audit_log = Permission.find_by(key: "view_audit_log")

    owner_role.permissions.delete(reset_two_factor) if reset_two_factor
    owner_role.permissions.delete(view_audit_log) if view_audit_log
  end
end
