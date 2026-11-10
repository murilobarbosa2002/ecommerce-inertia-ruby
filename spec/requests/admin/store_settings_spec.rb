require "rails_helper"

RSpec.describe "Admin::StoreSettings", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:manage_store_settings) { create(:permission, key: "manage_store_settings") }
  let(:role_with_permission) do
    create(:role).tap { |role| role.permissions << manage_store_settings }
  end
  let(:role_without_permission) { create(:role) }

  describe "autorização" do
    it "bloqueia GET /admin/store-setting/edit pra admin sem a permissão manage_store_settings" do
      admin = create(:admin, :with_two_factor_enabled, role: role_without_permission)
      sign_in(admin)

      get edit_admin_store_setting_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end

    it "permite GET /admin/store-setting/edit pra admin com a permissão manage_store_settings" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      get edit_admin_store_setting_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/store-setting/edit" do
    it "mostra o name atual e logo_url nil quando não há logo" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      StoreSetting.instance.update!(name: "Loja Teste", change_reason: "Setup")

      get edit_admin_store_setting_path

      page_data = JSON.parse(response.body[/data-page="app" type="application\/json">(.*?)<\/script>/m, 1])
      expect(page_data["props"]["name"]).to eq("Loja Teste")
      expect(page_data["props"]["logo_url"]).to be_nil
    end

    it "mostra a logo_url quando existe logo anexado" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      setting = StoreSetting.instance
      setting.change_reason = "Logo novo"
      setting.logo.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/logo.png")),
        filename: "logo.png",
        content_type: "image/png",
      )
      setting.save!

      get edit_admin_store_setting_path

      page_data = JSON.parse(response.body[/data-page="app" type="application\/json">(.*?)<\/script>/m, 1])
      expect(page_data["props"]["logo_url"]).to be_present
    end
  end

  describe "PATCH /admin/store-setting" do
    it "atualiza só o name, registrando o audit event com quem agiu e o motivo" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      expect do
        patch admin_store_setting_path, params: {
          name: "Nova Loja",
          change_reason: "Atualizando nome da loja"
        }
      end.to change(AuditEvent, :count).by(1)

      expect(response).to redirect_to(edit_admin_store_setting_path)
      expect(flash[:notice]).to eq("Configurações da loja atualizadas com sucesso")
      expect(StoreSetting.instance.name).to eq("Nova Loja")

      event = AuditEvent.last
      expect(event.event_type).to eq("store_settings_updated")
      expect(event.admin).to be_nil
      expect(event.performed_by_admin).to eq(admin)
      expect(event.metadata["change_reason"]).to eq("Atualizando nome da loja")

      # change_reason prova o "por quê", whodunnit prova o "quem" — as duas
      # partes, não só uma (CONTRIBUTING.md, seção Testes).
      version = StoreSetting.instance.versions.last
      expect(version.event).to eq("update")
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Atualizando nome da loja")
    end

    it "atualiza só o logo, registrando o audit event (o único rastro de QUAL campo mudou)" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      logo = fixture_file_upload(Rails.root.join("spec/fixtures/files/logo.png"), "image/png")

      expect do
        patch admin_store_setting_path, params: {
          change_reason: "Logo novo da loja",
          logo: logo
        }
      end.to change(AuditEvent, :count).by(1)

      expect(response).to redirect_to(edit_admin_store_setting_path)
      expect(StoreSetting.instance.logo).to be_attached

      event = AuditEvent.last
      expect(event.event_type).to eq("store_settings_updated")
      expect(event.metadata["change_reason"]).to eq("Logo novo da loja")

      # Active Storage aciona um touch no registro pai ao anexar (touch:
      # true padrão, ActiveStorage.touch_attachment_records) — isso ainda
      # gera uma versão no PaperTrail (via on_touch), com change_reason/
      # whodunnit corretos (meta sempre mesclado, mesmo em touch), mas SEM
      # object_changes (logo não é coluna, não é atributo rastreado por
      # tracked_by_change_reason :name) — por isso o AuditEvent, não essa
      # versão, é o único jeito de saber QUAL campo mudou.
      version = StoreSetting.instance.versions.last
      expect(version.event).to eq("update")
      expect(version.whodunnit).to eq(admin.id.to_s)
      expect(version.change_reason).to eq("Logo novo da loja")
      expect(version.object_changes).to be_blank
    end

    it "não troca o logo existente quando o campo logo vem vazio" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      setting = StoreSetting.instance
      setting.change_reason = "Logo original"
      setting.logo.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/logo.png")),
        filename: "logo.png",
        content_type: "image/png",
      )
      setting.save!
      original_blob_id = setting.logo.blob.id

      patch admin_store_setting_path, params: { name: "Só o nome", change_reason: "Só trocando o nome" }

      expect(StoreSetting.instance.logo.blob.id).to eq(original_blob_id)
    end

    it "não atualiza e redireciona com alert sem change_reason" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      expect do
        patch admin_store_setting_path, params: { name: "Sem motivo", change_reason: "" }
      end.not_to change(AuditEvent, :count)

      expect(response).to redirect_to(edit_admin_store_setting_path)
      expect(flash[:alert]).to be_present
      expect(StoreSetting.instance.name).not_to eq("Sem motivo")
    end

    it "não atualiza e redireciona com alert quando o logo é inválido" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      invalid_logo = fixture_file_upload(Rails.root.join("spec/fixtures/files/not_an_image.txt"), "text/plain")

      expect do
        patch admin_store_setting_path, params: { change_reason: "Logo errado", logo: invalid_logo }
      end.not_to change(AuditEvent, :count)

      expect(response).to redirect_to(edit_admin_store_setting_path)
      expect(flash[:alert]).to be_present
      expect(StoreSetting.instance.logo).not_to be_attached
    end

    it "bloqueia update pra admin sem a permissão manage_store_settings" do
      admin = create(:admin, :with_two_factor_enabled, role: role_without_permission)
      sign_in(admin)

      expect do
        patch admin_store_setting_path, params: { name: "Não deveria mudar", change_reason: "Teste" }
      end.not_to change(AuditEvent, :count)

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end
  end
end
