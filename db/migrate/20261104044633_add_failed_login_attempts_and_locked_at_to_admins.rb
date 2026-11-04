class AddFailedLoginAttemptsAndLockedAtToAdmins < ActiveRecord::Migration[8.1]
  def change
    add_column :admins, :failed_login_attempts, :integer, null: false, default: 0
    add_column :admins, :locked_at, :datetime
  end
end
