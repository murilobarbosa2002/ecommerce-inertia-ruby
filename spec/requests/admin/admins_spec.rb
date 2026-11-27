require "rails_helper"

RSpec.describe "Admin::Admins", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    # Com 2FA ativo, a senha certa só deixa o login "pendente" — precisa
    # confirmar o código TOTP pra criar a AdminSession de verdade.
    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:manage_admins) { create(:permission, key: "manage_admins") }
  let(:role_with_permission) do
    create(:role).tap { |role| role.permissions << manage_admins }
  end
  let(:role_without_permission) { create(:role) }

  describe "autorização" do
    it "bloqueia GET /admin/admins pra admin sem a permissão manage_admins" do
      admin = create(:admin, :with_two_factor_enabled, role: role_without_permission)
      sign_in(admin)

      get admin_admins_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end

    it "permite GET /admin/admins pra admin com a permissão manage_admins" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      get admin_admins_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/admins" do
    def inertia_props(params = {})
      get admin_admins_path, params: params,
                              headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "lista os admins existentes" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:admin, email_address: "outro@example.com", role: role_without_permission)

      get admin_admins_path

      expect(response).to have_http_status(:ok)
    end

    it "filtra pela busca enviada" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:admin, first_name: "Carla", email_address: "carla@example.com", role: role_without_permission)

      props = inertia_props(admins_search: "Carla")

      expect(props.dig("admins", "records").pluck("email_address")).to eq([ "carla@example.com" ])
    end

    it "pagina os resultados" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      3.times { |n| create(:admin, first_name: "Admin#{n}", role: role_without_permission) }

      props = inertia_props(admins_page: 2, admins_sort: "name")

      expect(props.dig("admins", "page")).to eq(2)
      expect(props.dig("admins", "total_count")).to eq(4)
    end
  end

  describe "POST /admin/admins" do
    it "cria um admin novo com os dados enviados" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      expect do
        post admin_admins_path, params: {
          email_address: "novo@example.com",
          first_name: "Novo",
          last_name: "Admin",
          password: AdminCredentials::VALID_PASSWORD,
          password_confirmation: AdminCredentials::VALID_PASSWORD,
          role_id: role_without_permission.id,
          change_reason: "Novo admin da equipe de suporte"
        }
      end.to change(Admin, :count).by(1)

      expect(response).to redirect_to(admin_admins_path)
      expect(Admin.last.email_address).to eq("novo@example.com")
    end

    it "registra o motivo digitado e quem criou na versão do PaperTrail" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      post admin_admins_path, params: {
        email_address: "novo@example.com",
        first_name: "Novo",
        last_name: "Admin",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_without_permission.id,
        change_reason: "Novo admin da equipe de suporte"
      }

      version = Admin.last.versions.last
      expect(version.change_reason).to eq("Novo admin da equipe de suporte")
      expect(version.whodunnit).to eq(admin.id.to_s)
    end

    it "não cria e redireciona de volta quando o e-mail já existe" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:admin, email_address: "duplicado@example.com")

      expect do
        post admin_admins_path, params: {
          email_address: "duplicado@example.com",
          first_name: "Novo",
          last_name: "Admin",
          password: AdminCredentials::VALID_PASSWORD,
          password_confirmation: AdminCredentials::VALID_PASSWORD,
          role_id: role_without_permission.id,
          change_reason: "Teste"
        }
      end.not_to change(Admin, :count)

      expect(response).to redirect_to(new_admin_admin_path)
      expect(flash[:alert]).to eq("E-mail já está em uso")
    end

    it "não cria e redireciona de volta quando o celular informado é inválido" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      expect do
        post admin_admins_path, params: {
          email_address: "novo@example.com",
          first_name: "Novo",
          last_name: "Admin",
          phone: "123",
          password: AdminCredentials::VALID_PASSWORD,
          password_confirmation: AdminCredentials::VALID_PASSWORD,
          role_id: role_without_permission.id,
          change_reason: "Teste"
        }
      end.not_to change(Admin, :count)

      expect(response).to redirect_to(new_admin_admin_path)
      expect(flash[:alert]).to eq("Celular não é válido")
    end
  end

  describe "GET /admin/admins/:id/edit" do
    it "renderiza o formulário de edição do admin" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, email_address: "editar@example.com", role: role_without_permission)

      get edit_admin_admin_path(target)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /admin/admins/:id" do
    it "atualiza o e-mail com motivo, registrando versão no PaperTrail com quem alterou" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, email_address: "antigo@example.com", role: role_without_permission)

      patch admin_admin_path(target), params: {
        email_address: "novo-email@example.com",
        role_id: role_without_permission.id,
        change_reason: "Correção de digitação no e-mail"
      }

      expect(response).to redirect_to(admin_admins_path)
      expect(target.reload.email_address).to eq("novo-email@example.com")
      version = target.versions.last
      expect(version.change_reason).to eq("Correção de digitação no e-mail")
      expect(version.whodunnit).to eq(admin.id.to_s)
    end

    it "não atualiza e redireciona de volta sem motivo quando o e-mail muda" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, email_address: "antigo@example.com", role: role_without_permission)

      patch admin_admin_path(target), params: {
        email_address: "novo-email@example.com",
        role_id: role_without_permission.id,
        change_reason: ""
      }

      expect(target.reload.email_address).to eq("antigo@example.com")
      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Motivo da alteração não pode ficar em branco")
    end

    it "atualiza o papel com motivo, registrando versão no PaperTrail com quem alterou" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      other_role = create(:role)
      target = create(:admin, role: role_without_permission)

      expect do
        patch admin_admin_path(target), params: {
          email_address: target.email_address,
          role_id: other_role.id,
          change_reason: "Promovido pra outro papel"
        }
      end.to change { target.reload.versions.count }.by(1)

      expect(target.role_id).to eq(other_role.id)
      expect(target.versions.last.change_reason).to eq("Promovido pra outro papel")
      expect(target.versions.last.whodunnit).to eq(admin.id.to_s)
      expect(target.versions.last.changeset["role_id"]).to eq(
        [ role_without_permission.id, other_role.id ],
      )
    end

    it "não atualiza e redireciona de volta sem motivo quando o papel muda" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      other_role = create(:role)
      target = create(:admin, role: role_without_permission)

      patch admin_admin_path(target), params: {
        email_address: target.email_address,
        role_id: other_role.id,
        change_reason: ""
      }

      expect(target.reload.role_id).to eq(role_without_permission.id)
      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Motivo da alteração não pode ficar em branco")
    end
  end

  describe "POST /admin/admins/:id/reset_two_factor" do
    let(:reset_two_factor) { create(:permission, key: "reset_two_factor") }
    let(:role_with_both_permissions) do
      create(:role).tap { |role| role.permissions << manage_admins << reset_two_factor }
    end
    let(:role_with_only_reset_two_factor) do
      create(:role).tap { |role| role.permissions << reset_two_factor }
    end

    it "bloqueia pra admin sem manage_admins, mesmo com reset_two_factor" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_only_reset_two_factor)
      sign_in(admin)
      target = create(:admin, :with_two_factor_enabled, role: role_without_permission)

      post reset_two_factor_admin_admin_path(target)

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
      expect(target.reload.otp_required_for_login?).to be true
    end

    it "bloqueia pra admin com manage_admins mas sem reset_two_factor" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, :with_two_factor_enabled, role: role_without_permission)

      post reset_two_factor_admin_admin_path(target)

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
      expect(target.reload.otp_required_for_login?).to be true
    end

    it "reseta o 2FA de outro admin, registrando quem agiu e quem foi afetado" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, :with_two_factor_enabled, role: role_without_permission)

      post reset_two_factor_admin_admin_path(target)

      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:notice]).to eq("2FA resetado — esse admin vai precisar configurar de novo no próximo login")
      target.reload
      expect(target.otp_required_for_login?).to be false
      expect(target.otp_secret).to be_nil
      expect(target.admin_recovery_codes).to be_empty

      event = AuditEvent.last
      expect(event.event_type).to eq("two_factor_reset_by_admin")
      expect(event.admin).to eq(target)
      expect(event.performed_by_admin).to eq(admin)
    end

    it "não permite resetar o próprio 2FA por essa rota" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)

      post reset_two_factor_admin_admin_path(admin)

      expect(response).to redirect_to(edit_admin_admin_path(admin))
      expect(flash[:alert]).to eq("Não é possível resetar o próprio 2FA por aqui — use a tela de perfil")
      expect(admin.reload.otp_required_for_login?).to be true
    end

    it "não reseta e avisa quando o admin alvo já está sem 2FA ativo" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)

      expect do
        post reset_two_factor_admin_admin_path(target)
      end.not_to change(AuditEvent, :count)

      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Esse admin já está sem 2FA ativo")
    end
  end

  describe "DELETE /admin/admins/:id" do
    let(:delete_admin) { create(:permission, key: "delete_admin") }
    let(:role_with_both_permissions) do
      create(:role).tap { |role| role.permissions << manage_admins << delete_admin }
    end
    let(:role_with_only_delete_admin) do
      create(:role).tap { |role| role.permissions << delete_admin }
    end
    let(:owner_role) { create(:role, name: "owner") }

    it "bloqueia pra admin sem manage_admins, mesmo com delete_admin" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_only_delete_admin)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)

      delete admin_admin_path(target)

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
      expect(Admin.exists?(target.id)).to be true
    end

    it "bloqueia pra admin com manage_admins mas sem delete_admin" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)

      delete admin_admin_path(target)

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
      expect(Admin.exists?(target.id)).to be true
    end

    it "exclui outro admin informando senha e motivo, registrando quem agiu e quem foi excluído" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, email_address: "alvo@example.com", role: role_without_permission)

      delete admin_admin_path(target), params: {
        password: AdminCredentials::VALID_PASSWORD, change_reason: "Conta de teste não é mais necessária"
      }

      expect(response).to redirect_to(admin_admins_path)
      expect(flash[:notice]).to eq("Admin excluído com sucesso")
      expect(Admin.exists?(target.id)).to be false

      event = AuditEvent.find_by(event_type: "admin_deleted")
      expect(event).to be_present
      expect(event.admin).to be_nil
      expect(event.performed_by_admin).to eq(admin)
      expect(event.metadata["deleted_admin_email"]).to eq("alvo@example.com")
      expect(event.metadata["deleted_admin_role_name"]).to eq(role_without_permission.name)
    end

    it "não permite excluir a própria conta" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)

      delete admin_admin_path(admin), params: { password: AdminCredentials::VALID_PASSWORD, change_reason: "Teste" }

      expect(response).to redirect_to(edit_admin_admin_path(admin))
      expect(flash[:alert]).to eq("Não é possível excluir a própria conta")
      expect(Admin.exists?(admin.id)).to be true
    end

    it "não permite excluir o último admin com o papel owner" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, role: owner_role)

      delete admin_admin_path(target), params: {
        password: AdminCredentials::VALID_PASSWORD, change_reason: "Teste"
      }

      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Não é possível excluir o último admin com o papel owner")
      expect(Admin.exists?(target.id)).to be true
    end

    it "permite excluir um admin com papel owner quando não é o último" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      create(:admin, role: owner_role)
      target = create(:admin, role: owner_role)

      delete admin_admin_path(target), params: {
        password: AdminCredentials::VALID_PASSWORD, change_reason: "Teste"
      }

      expect(response).to redirect_to(admin_admins_path)
      expect(Admin.exists?(target.id)).to be false
    end

    it "não exclui com senha incorreta, e conta pra o limite de tentativas de quem agiu" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)

      expect do
        delete admin_admin_path(target), params: { password: "senha-errada", change_reason: "Teste" }
      end.to change { admin.reload.failed_login_attempts }.by(1)

      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Senha incorreta")
      expect(Admin.exists?(target.id)).to be true
    end

    it "não exclui sem motivo, e não registra nenhum evento de auditoria" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)

      expect do
        delete admin_admin_path(target), params: { password: AdminCredentials::VALID_PASSWORD, change_reason: "" }
      end.not_to change(AuditEvent, :count)

      expect(response).to redirect_to(edit_admin_admin_path(target))
      expect(flash[:alert]).to eq("Motivo da alteração não pode ficar em branco")
      expect(Admin.exists?(target.id)).to be true
    end

    it "preserva o histórico de auditoria da conta excluída, sem admin associado" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_both_permissions)
      sign_in(admin)
      target = create(:admin, role: role_without_permission)
      login_event = AuditEvents::RecordAuditEvent.call(
        event_type: :login_succeeded, admin: target, performed_by_admin: target
      )

      delete admin_admin_path(target), params: {
        password: AdminCredentials::VALID_PASSWORD, change_reason: "Teste"
      }

      expect(login_event.reload.admin).to be_nil
      expect(login_event.event_type).to eq("login_succeeded")
    end
  end
end
