require "rails_helper"

RSpec.describe AuditEvents::Search do
  def call(**)
    described_class.call(**)
  end

  describe "tipos de evento" do
    it "sem event_types retorna todos os 17 tipos" do
      AuditEvent.event_types.each_key { |type| create(:audit_event, event_type: type) }

      result = call

      expect(result.total_count).to eq(17)
    end

    it "filtra por um subconjunto de tipos" do
      alvo = create(:audit_event, event_type: :login_succeeded)
      create(:audit_event, event_type: :logout)

      result = call(event_types: %w[login_succeeded])

      expect(result.events).to contain_exactly(alvo)
    end

    it "event_types vazio ([]) é 'nenhum tipo', distinto de nil ('todos')" do
      create(:audit_event, event_type: :login_succeeded)

      result = call(event_types: [])

      expect(result.events).to be_empty
    end

    it "ignora um tipo desconhecido, sem levantar erro" do
      alvo = create(:audit_event, event_type: :login_succeeded)

      result = call(event_types: %w[login_succeeded tipo-que-nao-existe])

      expect(result.events).to contain_exactly(alvo)
    end
  end

  describe "busca por e-mail (sujeito ou ator)" do
    it "filtra pelo e-mail do sujeito (admin)" do
      sujeito = create(:admin, email_address: "sujeito@example.com")
      alvo = create(:audit_event, admin: sujeito)
      create(:audit_event)

      result = call(query: "sujeito")

      expect(result.events).to contain_exactly(alvo)
    end

    it "filtra pelo e-mail do ator (performed_by_admin)" do
      ator = create(:admin, email_address: "ator@example.com")
      alvo = create(:audit_event, performed_by_admin: ator)
      create(:audit_event)

      result = call(query: "ator")

      expect(result.events).to contain_exactly(alvo)
    end

    it "escapa caractere curinga do ILIKE (% e _) digitado na busca" do
      create(:admin, email_address: "ana@example.com").tap { |admin| create(:audit_event, admin: admin) }

      result = call(query: "%")

      expect(result.events).to be_empty
    end
  end

  describe "filtro por usuário (performed_by_admin_ids)" do
    it "filtra só os eventos de um usuário" do
      ator = create(:admin)
      outro_ator = create(:admin)
      alvo = create(:audit_event, performed_by_admin: ator)
      create(:audit_event, performed_by_admin: outro_ator)

      result = call(performed_by_admin_ids: [ ator.id ])

      expect(result.events).to contain_exactly(alvo)
    end

    it "filtra pelos eventos de múltiplos usuários ao mesmo tempo" do
      ator = create(:admin)
      outro_ator = create(:admin)
      terceiro_ator = create(:admin)
      alvo1 = create(:audit_event, performed_by_admin: ator)
      alvo2 = create(:audit_event, performed_by_admin: outro_ator)
      create(:audit_event, performed_by_admin: terceiro_ator)

      result = call(performed_by_admin_ids: [ ator.id, outro_ator.id ])

      expect(result.events).to contain_exactly(alvo1, alvo2)
    end

    it "sem performed_by_admin_ids não filtra por usuário" do
      create(:admin).tap { |admin| create(:audit_event, performed_by_admin: admin) }
      create(:audit_event)

      result = call

      expect(result.total_count).to eq(2)
    end
  end

  describe "período" do
    it "filtra por created_at (from/to)" do
      dentro = create(:audit_event, created_at: Time.zone.parse("2026-06-15"))
      create(:audit_event, created_at: Time.zone.parse("2026-01-01"))

      result = call(
        from: Time.zone.parse("2026-06-01"),
        to: Time.zone.parse("2026-06-30"),
      )

      expect(result.events).to contain_exactly(dentro)
    end
  end

  describe "ordenação e paginação" do
    it "ordena por created_at decrescente (mais recente primeiro) por padrão" do
      antigo = create(:audit_event, created_at: 2.days.ago)
      recente = create(:audit_event, created_at: 1.hour.ago)

      result = call

      expect(result.events.to_a).to eq([ recente, antigo ])
    end

    it "inverte pra ascendente quando pedido" do
      antigo = create(:audit_event, created_at: 2.days.ago)
      recente = create(:audit_event, created_at: 1.hour.ago)

      result = call(sort: "happened_at", direction: "asc")

      expect(result.events.to_a).to eq([ antigo, recente ])
    end

    it "ignora uma chave de ordenação desconhecida, caindo no padrão (happened_at)" do
      antigo = create(:audit_event, created_at: 2.days.ago)
      recente = create(:audit_event, created_at: 1.hour.ago)

      result = call(sort: "coluna-que-nao-existe")

      expect(result.events.to_a).to eq([ recente, antigo ])
    end

    it "pagina manualmente (limit/offset), sem gem" do
      4.times { create(:audit_event) }

      result = call(page: 2, per_page: 2)

      expect(result.events.count).to eq(2)
      expect(result.page).to eq(2)
      expect(result.total_count).to eq(4)
      expect(result.total_pages).to eq(2)
    end
  end
end
