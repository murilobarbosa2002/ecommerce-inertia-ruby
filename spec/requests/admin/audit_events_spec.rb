require "rails_helper"

RSpec.describe "Admin::AuditEvents", type: :request do
  def sign_in(admin)
    post admin_session_path, params: { email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD }
    return unless admin.otp_required_for_login?

    post admin_two_factor_authentication_path, params: { otp_code: ROTP::TOTP.new(admin.otp_secret).now }
  end

  let(:view_audit_log) { create(:permission, key: "view_audit_log") }
  let(:role_with_permission) do
    create(:role).tap { |role| role.permissions << view_audit_log }
  end
  let(:role_without_permission) { create(:role) }

  describe "autorização" do
    it "bloqueia GET /admin/audit_events pra admin sem a permissão view_audit_log" do
      admin = create(:admin, role: role_without_permission)
      sign_in(admin)

      get admin_audit_events_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Você não tem permissão pra acessar essa página")
    end

    it "permite GET /admin/audit_events pra admin com a permissão view_audit_log" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      get admin_audit_events_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /admin/audit_events" do
    def inertia_props(params = {})
      get admin_audit_events_path, params: params,
                                    headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }
      JSON.parse(response.body).fetch("props")
    end

    it "lista os eventos existentes" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:audit_event, event_type: :logout, created_at: 2.days.ago)

      props = inertia_props

      event_types = props.dig("audit_events", "records").pluck("event_type")
      expect(event_types).to include("logout")
    end

    it "expõe a lista de admins pro filtro de ator" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)

      props = inertia_props

      expect(props["actors"]).to include(
        "id" => admin.id, "email_address" => admin.email_address
      )
    end

    it "filtra pela busca enviada" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      outro = create(:admin, email_address: "alvo-da-busca@example.com", role: role_without_permission)
      create(:audit_event, admin: outro)

      props = inertia_props(audit_events_search: "alvo-da-busca")

      expect(props.dig("audit_events", "records").pluck("admin_email")).to eq(
        [ "alvo-da-busca@example.com" ],
      )
    end

    it "filtra por tipo de evento" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:audit_event, event_type: :logout)

      props = inertia_props(audit_events_event_types: "login_succeeded")

      expect(props.dig("audit_events", "records").pluck("event_type")).not_to include("logout")
    end

    it "filtra por usuário" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      ator = create(:admin, role: role_without_permission)
      create(:audit_event, performed_by_admin: ator)

      props = inertia_props(audit_events_actor_ids: ator.id.to_s)

      expect(props.dig("audit_events", "records").pluck("performed_by_admin_email")).to eq(
        [ ator.email_address ],
      )
    end

    it "filtra por múltiplos usuários ao mesmo tempo" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      ator1 = create(:admin, role: role_without_permission)
      ator2 = create(:admin, role: role_without_permission)
      create(:audit_event, performed_by_admin: ator1)
      create(:audit_event, performed_by_admin: ator2)

      props = inertia_props(audit_events_actor_ids: "#{ator1.id},#{ator2.id}")

      expect(props.dig("audit_events", "records").pluck("performed_by_admin_email")).to contain_exactly(
        ator1.email_address, ator2.email_address,
      )
    end

    it "expõe o papel do usuário que realizou a ação" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      ator = create(:admin, role: role_without_permission)
      create(:audit_event, performed_by_admin: ator)

      props = inertia_props(audit_events_actor_ids: ator.id.to_s)

      expect(props.dig("audit_events", "records").pluck("performed_by_admin_role_name")).to eq(
        [ role_without_permission.name ],
      )
    end

    it "expõe o IP só quando não há usuário identificado" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      create(:audit_event, event_type: :login_failed, admin: nil, performed_by_admin: nil, ip_address: "203.0.113.5")

      props = inertia_props(audit_events_event_types: "login_failed")

      record = props.dig("audit_events", "records").find { |r| r["event_type"] == "login_failed" }
      expect(record["ip_address"]).to eq("203.0.113.5")
    end

    it "pagina os resultados" do
      admin = create(:admin, :with_two_factor_enabled, role: role_with_permission)
      sign_in(admin)
      3.times { create(:audit_event) }

      props = inertia_props(audit_events_page: 1)

      expect(props.dig("audit_events", "page")).to eq(1)
      # >= 3 (não um número exato): o próprio login do admin acima, via
      # fluxo real de autenticação, já gera eventos de auditoria
      # (password_verified/login_succeeded) além dos 3 criados direto.
      expect(props.dig("audit_events", "total_count")).to be >= 3
    end
  end
end
