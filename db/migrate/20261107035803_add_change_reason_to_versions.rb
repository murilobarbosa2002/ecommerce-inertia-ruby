class AddChangeReasonToVersions < ActiveRecord::Migration[8.1]
  def change
    # :string do Postgres não tem limite de tamanho por padrão (ver
    # CONTRIBUTING.md, "Padrões de código") — change_reason é texto digitado
    # por um admin, por isso o limite explícito, espelhado na validação do
    # concern ChangeReasonRequired.
    add_column :versions, :change_reason, :string, limit: 500
  end
end
