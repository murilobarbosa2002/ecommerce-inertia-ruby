require "rails_helper"

RSpec.describe AuditEvents::RecentActivity do
  describe ".call" do
    it "só retorna os event_type relevantes como sinal de segurança, mesmo havendo outros" do
      create(:audit_event, event_type: :login_succeeded)
      create(:audit_event, event_type: :two_factor_verified)
      create(:audit_event, event_type: :password_verified)

      event_types = described_class.call.events.map(&:event_type)

      expect(event_types).to contain_exactly("login_succeeded")
    end

    it "ordena do mais recente pro mais antigo" do
      older = create(:audit_event, event_type: :login_succeeded, created_at: 2.days.ago)
      newer = create(:audit_event, event_type: :login_failed, created_at: 1.hour.ago)

      expect(described_class.call.events).to eq([ newer, older ])
    end

    describe "filtro por event_types" do
      it "só retorna os tipos pedidos, dentro dos relevantes" do
        create(:audit_event, event_type: :login_succeeded)
        create(:audit_event, event_type: :account_locked)

        event_types = described_class.call(event_types: [ "account_locked" ]).events.map(&:event_type)

        expect(event_types).to contain_exactly("account_locked")
      end

      it "ignora qualquer tipo pedido que não esteja entre os relevantes (fronteira de confiança), sem cair num fallback" do
        create(:audit_event, event_type: :login_succeeded)
        create(:audit_event, event_type: :password_verified)

        events = described_class.call(event_types: [ "password_verified" ]).events

        expect(events).to be_empty
      end

      it "nil devolve todos os relevantes (nenhum filtro aplicado ainda)" do
        create(:audit_event, event_type: :login_succeeded)
        create(:audit_event, event_type: :account_locked)

        expect(described_class.call(event_types: nil).events.map(&:event_type))
          .to contain_exactly("login_succeeded", "account_locked")
      end

      it "[] (explicitamente vazio) não devolve nenhum evento — desmarcar tudo no filtro significa mostrar nada" do
        create(:audit_event, event_type: :login_succeeded)
        create(:audit_event, event_type: :account_locked)

        expect(described_class.call(event_types: []).events).to be_empty
      end
    end

    describe "filtro por data e hora" do
      # from/to chegam como um instante completo (Time), não uma Date —
      # quem decide o limite exato (ex. início/fim do dia quando só a data
      # foi escolhida, sem hora) é quem chama (DashboardsController a
      # partir do que o frontend manda), não esta classe.
      it "respeita from (inclusive)" do
        create(:audit_event, event_type: :login_succeeded, created_at: 5.days.ago)
        recent = create(:audit_event, event_type: :login_succeeded, created_at: 1.day.ago)

        expect(described_class.call(from: 2.days.ago.beginning_of_day).events).to eq([ recent ])
      end

      it "respeita to (inclusive)" do
        old = create(:audit_event, event_type: :login_succeeded, created_at: 5.days.ago)
        create(:audit_event, event_type: :login_succeeded, created_at: 1.day.ago)

        expect(described_class.call(to: 4.days.ago.end_of_day).events).to eq([ old ])
      end

      it "filtra por hora dentro do mesmo dia" do
        morning = create(:audit_event, event_type: :login_succeeded, created_at: Time.zone.parse("2026-11-10 08:00"))
        evening = create(:audit_event, event_type: :login_succeeded, created_at: Time.zone.parse("2026-11-10 20:00"))

        result = described_class.call(
          from: Time.zone.parse("2026-11-10 07:00"),
          to: Time.zone.parse("2026-11-10 12:00")
        )

        expect(result.events).to eq([ morning ])
        expect(result.events).not_to include(evening)
      end
    end

    describe "paginação" do
      it "usa per_page de 10 por padrão" do
        create_list(:audit_event, 15, event_type: :login_succeeded)

        expect(described_class.call.events.size).to eq(10)
      end

      it "respeita per_page e page informados" do
        create_list(:audit_event, 25, event_type: :login_succeeded)

        result = described_class.call(per_page: 10, page: 2)

        expect(result.events.size).to eq(10)
        expect(result.page).to eq(2)
      end

      it "calcula total_count e total_pages a partir do filtro aplicado, não do total geral" do
        create_list(:audit_event, 25, event_type: :login_succeeded)
        create(:audit_event, event_type: :account_locked)

        result = described_class.call(event_types: [ "login_succeeded" ], per_page: 10)

        expect(result.total_count).to eq(25)
        expect(result.total_pages).to eq(3)
      end

      it "nunca aceita page menor que 1" do
        create(:audit_event, event_type: :login_succeeded)

        expect(described_class.call(page: 0).page).to eq(1)
        expect(described_class.call(page: -5).page).to eq(1)
      end

      it "total_pages é 1 (não 0) quando não há nenhum evento" do
        expect(described_class.call.total_pages).to eq(1)
      end
    end
  end
end
