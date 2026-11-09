require "rails_helper"

RSpec.describe "Admin::Admins", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
  end

  let(:manage_admins) { create(:permission, key: "manage_admins") }
  let(:role_with_permission) do
    create(:role).tap { |role| role.permissions << manage_admins }
  end
  let(:role_without_permission) { create(:role) }

  describe "autorização" do
    it "bloqueia GET /admin/admins pra admin sem a permissão manage_admins" do
      admin = create(:admin, role: role_without_permission)
      sign_in(admin)

      get admin_admins_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end

    it "permite GET /admin/admins pra admin com a permissão manage_admins" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)

      get admin_admins_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/admins" do
    it "lista os admins existentes" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)
      create(:admin, email_address: "outro@example.com", role: role_without_permission)

      get admin_admins_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /admin/admins" do
    it "cria um admin novo com os dados enviados" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)

      expect do
        post admin_admins_path, params: {
          email_address: "novo@example.com",
          password: AdminCredentials::VALID_PASSWORD,
          password_confirmation: AdminCredentials::VALID_PASSWORD,
          role_id: role_without_permission.id,
          change_reason: "Novo admin da equipe de suporte"
        }
      end.to change(Admin, :count).by(1)

      expect(response).to redirect_to(admin_admins_path)
      expect(Admin.last.email_address).to eq("novo@example.com")
    end

    it "registra o motivo digitado na versão do PaperTrail" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)

      post admin_admins_path, params: {
        email_address: "novo@example.com",
        password: AdminCredentials::VALID_PASSWORD,
        password_confirmation: AdminCredentials::VALID_PASSWORD,
        role_id: role_without_permission.id,
        change_reason: "Novo admin da equipe de suporte"
      }

      expect(Admin.last.versions.last.change_reason).to eq("Novo admin da equipe de suporte")
    end

    it "não cria e redireciona de volta quando o e-mail já existe" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)
      create(:admin, email_address: "duplicado@example.com")

      expect do
        post admin_admins_path, params: {
          email_address: "duplicado@example.com",
          password: AdminCredentials::VALID_PASSWORD,
          password_confirmation: AdminCredentials::VALID_PASSWORD,
          role_id: role_without_permission.id,
          change_reason: "Teste"
        }
      end.not_to change(Admin, :count)

      expect(response).to redirect_to(new_admin_admin_path)
      expect(flash[:alert]).to eq("E-mail já está em uso")
    end
  end

  describe "GET /admin/admins/:id/edit" do
    it "renderiza o formulário de edição do admin" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, email_address: "editar@example.com", role: role_without_permission)

      get edit_admin_admin_path(target)

      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /admin/admins/:id" do
    it "atualiza o e-mail com motivo, registrando versão no PaperTrail" do
      admin = create(:admin, role: role_with_permission)
      sign_in(admin)
      target = create(:admin, email_address: "antigo@example.com", role: role_without_permission)

      patch admin_admin_path(target), params: {
        email_address: "novo-email@example.com",
        role_id: role_without_permission.id,
        change_reason: "Correção de digitação no e-mail"
      }

      expect(response).to redirect_to(admin_admins_path)
      expect(target.reload.email_address).to eq("novo-email@example.com")
      expect(target.versions.last.change_reason).to eq("Correção de digitação no e-mail")
    end

    it "não atualiza e redireciona de volta sem motivo quando o e-mail muda" do
      admin = create(:admin, role: role_with_permission)
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
  end
end
