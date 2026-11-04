module AdminPanel
  class PasswordsMailer < ApplicationMailer
    def reset(admin)
      @admin = admin
      mail subject: I18n.t("admin_panel.passwords_mailer.reset.subject"), to: admin.email_address
    end
  end
end
