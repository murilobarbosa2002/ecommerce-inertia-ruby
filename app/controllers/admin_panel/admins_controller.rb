module AdminPanel
  class AdminsController < AdminPanel::BaseController
    require_permission :manage_admins
    require_permission :reset_two_factor, only: :reset_two_factor
    require_permission :delete_admin, only: :destroy

    def index
      result = Admins::Search.call(
        query: params[:admins_search],
        sort: params[:admins_sort],
        direction: params[:admins_direction],
        page: params[:admins_page]
      )

      render inertia: "Admin/Admins/Index", props: {
        admins: {
          records: result.admins.map { |admin| admin_json(admin) },
          page: result.page,
          total_pages: result.total_pages,
          total_count: result.total_count
        }
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

    def destroy
      target = Admin.find(params[:id])

      if target == Current.admin
        redirect_to edit_admin_admin_path(target), alert: I18n.t("admin.admins.destroy.cannot_delete_self")
        return
      end

      if last_owner?(target)
        redirect_to edit_admin_admin_path(target), alert: I18n.t("admin.admins.destroy.cannot_delete_last_owner")
        return
      end

      unless Current.admin.authenticate(params[:password])
        AdminAuthentication::RecordFailedLoginAttempt.call(
          admin: Current.admin, request: request, event_type: :reauthentication_failed
        )
        redirect_to edit_admin_admin_path(target), alert: I18n.t("admin.admins.destroy.invalid_password")
        return
      end

      destroyed = false
      Admin.transaction do
        # Registrado ANTES do destroy, na mesma transação: admin_id (deste
        # e de todo evento histórico do alvo) vira nulo logo depois, via
        # on_delete: :nullify (docs/adr/0041) — metadata é o único jeito de
        # a auditoria continuar identificando quem foi excluído. Inserir
        # depois do destroy não dá: a FK não existiria mais pra apontar.
        # Envolto na mesma transação do destroy pra nenhum evento sobrar
        # registrado caso o destroy aborte (ex. change_reason em branco).
        AuditEvents::RecordAuditEvent.call(
          event_type: :admin_deleted,
          admin: target,
          request: request,
          metadata: { deleted_admin_email: target.email_address, deleted_admin_role_name: target.role.name }
        )
        target.change_reason = params[:change_reason]
        destroyed = target.destroy
        raise ActiveRecord::Rollback unless destroyed
      end

      if destroyed
        redirect_to admin_admins_path, notice: I18n.t("admin.admins.destroy.success")
      else
        redirect_to edit_admin_admin_path(target), alert: target.errors.full_messages.to_sentence
      end
    end

    private

    def last_owner?(target)
      target.role.name == "owner" && Admin.joins(:role).where(roles: { name: "owner" }).count <= 1
    end

    def admin_json(admin)
      {
        id: admin.id,
        email_address: admin.email_address,
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone: admin.phone,
        role_id: admin.role_id,
        role_name: admin.role.name
      }
    end

    def roles_json
      Role.order(:name).map { |role| { id: role.id, name: role.name } }
    end

    def admin_create_params
      params.permit(
        :email_address, :password, :password_confirmation, :first_name, :last_name, :phone, :role_id, :change_reason
      )
    end

    def admin_update_params
      params.permit(:email_address, :first_name, :last_name, :phone, :role_id, :change_reason)
    end
  end
end
