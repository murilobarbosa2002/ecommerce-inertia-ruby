class AddNameAndPhoneToAdmins < ActiveRecord::Migration[8.1]
  def up
    add_column :admins, :first_name, :string
    add_column :admins, :last_name, :string
    # Sem limite de tamanho na coluna de propósito: Active Record Encryption
    # (encrypts :phone, app/models/admin.rb) guarda o ciphertext, bem maior
    # que o número em si — uma validação de formato no model já garante o
    # formato esperado do texto plano.
    add_column :admins, :phone, :string

    # Backfill pros admins já existentes (ex. criados via admin:create antes
    # desta migration) — sem isso, change_column_null abaixo falharia com
    # qualquer linha já presente na tabela.
    Admin.reset_column_information
    Admin.unscoped.where(first_name: nil).update_all(first_name: "(sem nome)", last_name: "(sem sobrenome)")

    change_column_null :admins, :first_name, false
    change_column_null :admins, :last_name, false
  end

  def down
    remove_column :admins, :first_name
    remove_column :admins, :last_name
    remove_column :admins, :phone
  end
end
