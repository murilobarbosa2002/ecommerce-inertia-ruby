module AdminPanel
  class RolesController < AdminPanel::BaseController
    require_permission :manage_roles

    def index
      render inertia: "Admin/Roles/Index", props: {
        roles: Role.includes(:permissions).order(:name).map { |role| role_json(role) }
      }
    end

    def new
      render inertia: "Admin/Roles/New", props: { permissions: permissions_json }
    end

    def create
      role = Role.new(role_params)

      if role.save
        redirect_to admin_roles_path, notice: I18n.t("admin.roles.create.success")
      else
        redirect_to new_admin_role_path, alert: role.errors.full_messages.to_sentence
      end
    end

    def edit
      role = Role.includes(:permissions).find(params[:id])
      render inertia: "Admin/Roles/Edit", props: { role: role_json(role), permissions: permissions_json }
    end

    def update
      role = Role.find(params[:id])

      if role.update(role_params)
        redirect_to admin_roles_path, notice: I18n.t("admin.roles.update.success")
      else
        redirect_to edit_admin_role_path(role), alert: role.errors.full_messages.to_sentence
      end
    end

    private

    def role_json(role)
      {
        id: role.id,
        name: role.name,
        permission_ids: role.permissions.map(&:id),
        permission_keys: role.permissions.map(&:key)
      }
    end

    def permissions_json
      Permission.order(:key).map { |permission| { id: permission.id, key: permission.key, description: permission.description } }
    end

    def role_params
      params.permit(:name, :change_reason, permission_ids: [])
    end
  end
end
