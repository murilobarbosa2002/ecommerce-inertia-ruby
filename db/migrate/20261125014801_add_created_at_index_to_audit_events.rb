class AddCreatedAtIndexToAuditEvents < ActiveRecord::Migration[8.1]
  def change
    # O dashboard sempre restringe por um subconjunto pequeno de event_type
    # (AuditEvents::RecentActivity::RELEVANT_EVENT_TYPES) antes de ordenar
    # por created_at — nunca precisou de índice próprio. A tela de
    # auditoria completa (AuditEvents::Search) pode ordenar/paginar a
    # tabela inteira sem esse filtro, então o índice evita um seq scan
    # conforme o volume de eventos cresce.
    add_index :audit_events, :created_at
  end
end
