namespace :admin do
  desc I18n.t("cli.admin.create.description")
  task create: :environment do
    require "io/console"

    print I18n.t("cli.admin.create.prompt_email")
    email_address = $stdin.gets.chomp

    password = $stdin.getpass(I18n.t("cli.admin.create.prompt_password"))
    password_confirmation = $stdin.getpass(I18n.t("cli.admin.create.prompt_password_confirmation"))

    admin = Admin.new(
      email_address: email_address,
      password: password,
      password_confirmation: password_confirmation
    )

    if admin.save
      puts I18n.t("cli.admin.create.success", email_address: admin.email_address)
    else
      warn admin.errors.full_messages.join("\n")
      exit 1
    end
  end
end
