require "rails_helper"

RSpec.describe "Admin::Dashboards", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    # Com 2FA ativo, a senha certa só deixa o login "pendente" — precisa
    # confirmar o código TOTP pra criar a AdminSession de verdade.
    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  describe "GET / (root)" do
    it "renderiza o dashboard pro admin autenticado" do
      admin = create(:admin)
      sign_in(admin)

      get root_path

      expect(response).to have_http_status(:ok)
    end

    it "redireciona pro login quando não autenticado" do
      get root_path

      expect(response).to redirect_to(new_admin_session_path)
    end
  end

  # Props compartilhadas que o shell do painel (sidebar, menu do usuário)
  # lê em toda página autenticada — lidas pela resposta JSON do Inertia.
  describe "props compartilhadas do shell" do
    def inertia_props
      get root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "expõe o e-mail, nome e papel do admin logado" do
      admin = create(:admin)
      sign_in(admin)

      expect(inertia_props["current_admin"]).to eq(
        "email_address" => admin.email_address,
        "first_name" => admin.first_name,
        "last_name" => admin.last_name,
        "role_name" => admin.role.name
      )
    end

    it "expõe o nome da loja configurado, sem logo quando não há anexo" do
      StoreSetting.instance.update!(name: "Loja Aurora", change_reason: "Teste")
      sign_in(create(:admin))

      expect(inertia_props["store"]).to eq("name" => "Loja Aurora", "logo_url" => nil)
    end

    it "expõe a URL do logo quando há anexo" do
      setting = StoreSetting.instance
      setting.logo.attach(io: StringIO.new("<svg xmlns='http://www.w3.org/2000/svg'/>"), filename: "logo.svg", content_type: "image/svg+xml")
      setting.update!(change_reason: "Teste")
      sign_in(create(:admin))

      expect(inertia_props.dig("store", "logo_url")).to match(%r{/rails/active_storage/blobs/})
    end

    it "não cria o registro da loja só por renderizar a página (GET não escreve no banco)" do
      StoreSetting.delete_all
      sign_in(create(:admin))

      expect { inertia_props }.not_to change(StoreSetting, :count)
    end

    it "devolve nome vazio (nil) quando a loja ainda não tem nome" do
      StoreSetting.instance
      sign_in(create(:admin))

      expect(inertia_props.dig("store", "name")).to be_nil
    end
  end

  describe "props de stats" do
    def inertia_props
      get root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "conta o total de admins, quantos estão sem 2FA ativo e quantos estão com a conta bloqueada" do
      create(:admin, :with_two_factor_enabled)
      create(:admin)
      create(:admin, locked_at: Time.current)
      sign_in(create(:admin, :with_two_factor_enabled))

      expect(inertia_props["stats"]).to eq(
        "total_admins" => 4, "admins_without_two_factor" => 2, "locked_admins" => 1
      )
    end
  end

  describe "prop de atividade recente" do
    def inertia_props(params = {})
      get root_path, params: params, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    let(:role_with_permission) do
      create(:role).tap { |role| role.permissions << view_audit_log }
    end
    let(:view_audit_log) { Permission.find_or_create_by!(key: "view_audit_log") { |p| p.description = "Ver atividade" } }

    it "vem nil (não um objeto vazio) pra quem não tem a permissão view_audit_log" do
      sign_in(create(:admin, :with_two_factor_enabled, role: create(:role)))

      expect(inertia_props["activity"]).to be_nil
    end

    it "lista os eventos relevantes, do mais recente pro mais antigo, pra quem tem a permissão" do
      target = create(:admin)
      create(:audit_event, event_type: :account_unlocked, admin: target, performed_by_admin: target, created_at: 2.days.ago)
      create(:audit_event, event_type: :account_locked, admin: target, created_at: 1.hour.ago)
      create(:audit_event, event_type: :password_verified) # fora da lista de relevantes
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      event_types = inertia_props.dig("activity", "events").pluck("event_type")

      expect(event_types).to eq([ "account_locked", "account_unlocked" ])
    end

    it "expõe o metadata do evento (ex. o motivo digitado numa alteração das configurações da loja)" do
      create(:audit_event, event_type: :store_settings_updated, admin: nil, metadata: { change_reason: "Atualização de marca" })
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      event = inertia_props.dig("activity", "events").find { |e| e["event_type"] == "store_settings_updated" }

      expect(event["metadata"]).to eq("change_reason" => "Atualização de marca")
    end

    it "pagina os resultados, expondo page/per_page/total_count/total_pages" do
      create_list(:audit_event, 15, event_type: :account_locked)
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props(activity_page: 2)

      expect(props.dig("activity", "events").size).to eq(5) # 15 no total, página 2 de 10
      expect(props.dig("activity", "page")).to eq(2)
      expect(props.dig("activity", "per_page")).to eq(10)
      expect(props.dig("activity", "total_count")).to eq(15)
      expect(props.dig("activity", "total_pages")).to eq(2)
    end

    it "filtra por event_type via activity_event_types (string separada por vírgula)" do
      create(:audit_event, event_type: :store_settings_updated)
      create(:audit_event, event_type: :account_locked)
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props(activity_event_types: "account_locked")

      expect(props.dig("activity", "events").pluck("event_type")).to eq([ "account_locked" ])
    end

    it "activity_event_types vazio (todos desmarcados no filtro) não mostra nenhum evento" do
      create(:audit_event, event_type: :store_settings_updated)
      create(:audit_event, event_type: :account_locked)
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props(activity_event_types: "")

      expect(props.dig("activity", "events")).to eq([])
    end

    it "sem activity_event_types algum (nenhum filtro aplicado ainda) mostra todos os tipos relevantes" do
      create(:audit_event, event_type: :account_locked)
      create(:audit_event, event_type: :store_settings_updated)
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props

      expect(props.dig("activity", "events").pluck("event_type"))
        .to contain_exactly("account_locked", "store_settings_updated")
    end

    it "filtra por intervalo de data via activity_from/activity_to" do
      create(:audit_event, event_type: :account_locked, created_at: 10.days.ago)
      recent = create(:audit_event, event_type: :account_locked, created_at: 2.days.ago)
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props(activity_from: 5.days.ago.to_date.iso8601, activity_to: 1.day.ago.to_date.iso8601)
      ids = props.dig("activity", "events").pluck("id")

      expect(ids).to contain_exactly(recent.id)
    end

    it "filtra por hora dentro do mesmo dia (activity_from/activity_to com horário)" do
      morning = create(:audit_event, event_type: :account_locked, created_at: Time.zone.parse("2026-11-10 08:00"))
      create(:audit_event, event_type: :account_locked, created_at: Time.zone.parse("2026-11-10 20:00"))
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      props = inertia_props(activity_from: "2026-11-10T07:00", activity_to: "2026-11-10T12:00")
      ids = props.dig("activity", "events").pluck("id")

      expect(ids).to contain_exactly(morning.id)
    end

    it "ignora uma data inválida em vez de quebrar a página" do
      sign_in(create(:admin, :with_two_factor_enabled, role: role_with_permission))

      expect { inertia_props(activity_from: "não-é-uma-data") }.not_to raise_error
    end
  end

  describe "prop quick_action_keys" do
    def inertia_props
      get root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "expõe as chaves salvas do admin logado" do
      admin = create(:admin, quick_action_keys: [ "new_admin" ])
      sign_in(admin)

      expect(inertia_props["quick_action_keys"]).to eq([ "new_admin" ])
    end

    it "vem vazio quando o admin nunca configurou nada" do
      sign_in(create(:admin))

      expect(inertia_props["quick_action_keys"]).to eq([])
    end
  end
end
