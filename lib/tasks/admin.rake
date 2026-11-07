namespace :admin do
  desc I18n.t("cli.admin.create.description")
  task create: :environment do
    require "io/console"

    print I18n.t("cli.admin.create.prompt_email")
    email_address = $stdin.gets.chomp

    password = $stdin.getpass(I18n.t("cli.admin.create.prompt_password"))
    password_confirmation = $stdin.getpass(I18n.t("cli.admin.create.prompt_password_confirmation"))

    print I18n.t("cli.admin.create.prompt_change_reason")
    change_reason = $stdin.gets.chomp

    # "owner" vem de db/seeds.rb (docs/adr/0021) — se faltar, o banco não
    # rodou bin/rails db:seed ainda, não é algo pra essa task inventar.
    owner_role = Role.find_by(name: "owner")
    unless owner_role
      warn I18n.t("cli.admin.create.missing_owner_role")
      exit 1
    end

    admin = Admin.new(
      email_address: email_address,
      password: password,
      password_confirmation: password_confirmation,
      change_reason: change_reason,
      role: owner_role
    )

    if admin.save
      puts I18n.t("cli.admin.create.success", email_address: admin.email_address)
    else
      warn admin.errors.full_messages.join("\n")
      exit 1
    end
  end
end
