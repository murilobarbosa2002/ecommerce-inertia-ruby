class AddPerformedByAdminToAuditEvents < ActiveRecord::Migration[8.1]
  def change
    # Distinto de admin_id (de quem é o evento, ex. quem perdeu o 2FA) —
    # performed_by_admin_id é quem agiu (ex. quem resetou o 2FA de outro
    # admin). Nilable: ação de auto-serviço nem sempre tem um "outro" ator
    # (admin_id já cobre esse caso), e contexto de CLI/rake task não tem
    # Current.admin nenhum. on_delete: :nullify (não bloqueia excluir o
    # admin que performou uma ação só porque ele aparece num log antigo —
    # mesmo racional já previsto pra admin_id na PR L).
    add_reference :audit_events, :performed_by_admin,
      null: true, foreign_key: { to_table: :admins, on_delete: :nullify }
  end
end
