module AdminPanel
  class AdminsController < AdminPanel::BaseController
    require_permission :manage_admins
    require_permission :reset_two_factor, only: :reset_two_factor

    def index
      render inertia: "Admin/Admins/Index", props: {
        admins: Admin.includes(:role).order(:email_address).map { |admin| admin_json(admin) }
      }
    end

    def new
      render inertia: "Admin/Admins/New", props: { roles: roles_json }
    end

    def create
      admin = Admin.new(admin_create_params)

      if admin.save
        redirect_to admin_admins_path, notice: I18n.t("admin.admins.create.success")
      else
        # alert genérico, não erro por campo (inertia: { errors: ... }) — o
        # frontend não lê usePage().props.errors em lugar nenhum ainda
        # (mesmo padrão já usado em AdminPanel::PasswordsController#update).
        # Zod já valida tudo que o cliente consegue saber sozinho; o único
        # caso que só o servidor pode rejeitar aqui é e-mail duplicado.
        redirect_to new_admin_admin_path, alert: admin.errors.full_messages.to_sentence
      end
    end

    def edit
      admin = Admin.find(params[:id])
      render inertia: "Admin/Admins/Edit", props: { admin: admin_json(admin), roles: roles_json }
    end

    def update
      admin = Admin.find(params[:id])

      if admin.update(admin_update_params)
        redirect_to admin_admins_path, notice: I18n.t("admin.admins.update.success")
      else
        redirect_to edit_admin_admin_path(admin), alert: admin.errors.full_messages.to_sentence
      end
    end

    def reset_two_factor
      target = Admin.find(params[:id])

      if target == Current.admin
        # Resetar o próprio 2FA por essa rota pularia o fluxo normal de
        # autodesativação (AdminPanel::TwoFactorsController#destroy, que
        # exige reautenticar com a senha) — reset_two_factor é pra agir
        # sobre OUTRO admin, nunca sobre si mesmo.
        redirect_to edit_admin_admin_path(target), alert: I18n.t("admin.admins.reset_two_factor.cannot_reset_self")
        return
      end

      unless target.otp_required_for_login?
        # Mesma guarda já existente em bin/rails admin:disable_two_factor
        # (lib/tasks/admin.rake) — sem ela, clicar resetar num admin que já
        # está sem 2FA "funcionava" silenciosamente (AdminTwoFactor::
        # DisableTwoFactor não valida isso, só zera campos já zerados) e
        # ainda gerava um AuditEvent de reset que nunca aconteceu de fato.
        redirect_to edit_admin_admin_path(target), alert: I18n.t("admin.admins.reset_two_factor.not_enabled")
        return
      end

      AdminTwoFactor::DisableTwoFactor.call(admin: target, request: request, event_type: :two_factor_reset_by_admin)
      redirect_to edit_admin_admin_path(target), notice: I18n.t("admin.admins.reset_two_factor.success")
    end

    private

    def admin_json(admin)
      { id: admin.id, email_address: admin.email_address, role_id: admin.role_id, role_name: admin.role.name }
    end

    def roles_json
      Role.order(:name).map { |role| { id: role.id, name: role.name } }
    end

    def admin_create_params
      params.permit(:email_address, :password, :password_confirmation, :role_id, :change_reason)
    end

    def admin_update_params
      params.permit(:email_address, :role_id, :change_reason)
    end
  end
end
