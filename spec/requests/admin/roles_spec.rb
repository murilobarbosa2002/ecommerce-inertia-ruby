require "rails_helper"

RSpec.describe "Admin::Roles", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:manage_roles) { create(:permission, key: "manage_roles") }
  let(:role_with_permission) do
    create(:role).tap { |role| role.permissions << manage_roles }
  end
  let(:role_without_permission) { create(:role) }

  describe "autorização" do
    it "bloqueia GET /admin/roles pra admin sem a permissão manage_roles" do
      admin = create(:admin, :with_two_factor_enabled, role: role_without_permission)
      sign_in(admin)

      get admin_roles_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end

    it "permite GET /admin/roles pra admin com a permissão manage_roles" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      get admin_roles_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/roles" do
    it "lista os papéis existentes" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:role, name: "outro-papel")

      get admin_roles_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /admin/roles" do
    it "cria um papel novo com as permissões marcadas" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      extra_permission = create(:permission, key: "manage_store_settings")

      expect do
        post admin_roles_path, params: {
          name: "gerente",
          permission_ids: [ manage_roles.id, extra_permission.id ],
          change_reason: "Papel novo pro time de gerência"
        }
      end.to change(Role, :count).by(1)

      expect(response).to redirect_to(admin_roles_path)
      created_role = Role.find_by(name: "gerente")
      expect(created_role.permissions).to contain_exactly(manage_roles, extra_permission)
      version = created_role.versions.last
      expect(version.event).to eq("create")
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Papel novo pro time de gerência")
    end

    it "não cria e redireciona de volta quando o nome já existe" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:role, name: "duplicado")

      expect do
        post admin_roles_path, params: {
          name: "duplicado",
          permission_ids: [],
          change_reason: "Teste"
        }
      end.not_to change(Role, :count)

      expect(response).to redirect_to(new_admin_role_path)
    end

    it "não cria sem motivo da alteração" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      expect do
        post admin_roles_path, params: {
          name: "sem-motivo",
          permission_ids: [],
          change_reason: ""
        }
      end.not_to change(Role, :count)

      expect(response).to redirect_to(new_admin_role_path)
    end
  end

  describe "GET /admin/roles/:id/edit" do
    it "renderiza o formulário de edição do papel" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:role, name: "editar-papel")

      get edit_admin_role_path(target)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /admin/roles/:id" do
    it "atualiza as permissões do papel, registrando versão no PaperTrail" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      extra_permission = create(:permission, key: "manage_store_settings")
      target = create(:role, name: "papel-alvo")

      expect do
        patch admin_role_path(target), params: {
          name: target.name,
          permission_ids: [ extra_permission.id ],
          change_reason: "Concedendo acesso às configurações da loja"
        }
      end.to change { target.reload.permissions.to_a }.from([]).to([ extra_permission ])

      expect(response).to redirect_to(admin_roles_path)
    end

    it "exige motivo da alteração mesmo quando só a lista de permissões muda (nome igual)" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      extra_permission = create(:permission, key: "manage_store_settings")
      target = create(:role, name: "papel-sem-motivo")

      patch admin_role_path(target), params: {
        name: target.name,
        permission_ids: [ extra_permission.id ],
        change_reason: ""
      }

      expect(target.reload.permissions).to be_empty
      expect(response).to redirect_to(edit_admin_role_path(target))
      expect(flash[:alert]).to eq("Motivo da alteração não pode ficar em branco")
    end

    it "registra no PaperTrail do RolePermission qual permissão foi concedida, por quem e com qual motivo" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      extra_permission = create(:permission, key: "manage_store_settings")
      target = create(:role, name: "papel-auditado")

      patch admin_role_path(target), params: {
        name: target.name,
        permission_ids: [ extra_permission.id ],
        change_reason: "Concedendo acesso às configurações da loja"
      }

      role_permission = target.role_permissions.find_by(permission: extra_permission)
      version = role_permission.versions.last
      expect(version.event).to eq("create")
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Concedendo acesso às configurações da loja")
    end

    it "atualiza o nome do papel, registrando versão no PaperTrail com motivo e quem alterou" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:role, name: "nome-antigo")

      patch admin_role_path(target), params: {
        name: "nome-novo",
        permission_ids: [],
        change_reason: "Corrigindo o nome do papel"
      }

      expect(response).to redirect_to(admin_roles_path)
      expect(target.reload.name).to eq("nome-novo")
      version = target.versions.last
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Corrigindo o nome do papel")
    end

    it "registra no PaperTrail quem revogou uma permissão e com qual motivo, mesmo o registro sendo removido" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      kept_permission = create(:permission, key: "manage_store_settings")
      revoked_permission = create(:permission, key: "delete_admins")
      target = create(:role, name: "papel-revogado", permission_ids: [ kept_permission.id, revoked_permission.id ])

      expect do
        patch admin_role_path(target), params: {
          name: target.name,
          permission_ids: [ kept_permission.id ],
          change_reason: "Revogando acesso indevido"
        }
      end.to change { target.reload.permissions.to_a }.from([ kept_permission, revoked_permission ]).to([ kept_permission ])

      version = PaperTrail::Version.where(item_type: "RolePermission", event: "destroy").last
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Revogando acesso indevido")
    end
  end
end
