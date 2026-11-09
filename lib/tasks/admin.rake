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

  desc I18n.t("cli.admin.disable_two_factor.description")
  task :disable_two_factor, [ :email_address ] => :environment do |_task, args|
    # Último recurso: nem o próprio admin, nem nenhum outro com a permissão
    # reset_two_factor (tela de gerenciar admins) consegue mais logar — mesmo
    # limite de qualquer sistema de 2FA, sempre existe um caminho fora da
    # aplicação (conta root da AWS, owner de org no GitHub, etc.). Exige
    # acesso real de shell ao servidor, mesmo padrão de confiança de
    # admin:create — não é superfície nova de ataque.
    admin = Admin.find_by(email_address: args[:email_address])
    unless admin
      warn I18n.t("cli.admin.disable_two_factor.not_found", email_address: args[:email_address])
      exit 1
    end

    unless admin.otp_required_for_login?
      warn I18n.t("cli.admin.disable_two_factor.not_enabled", email_address: admin.email_address)
      exit 1
    end

    AdminTwoFactor::DisableTwoFactor.call(admin: admin)
    puts I18n.t("cli.admin.disable_two_factor.success", email_address: admin.email_address)
  end
end
