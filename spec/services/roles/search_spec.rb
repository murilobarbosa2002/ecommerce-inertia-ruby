require "rails_helper"

RSpec.describe Roles::Search do
  def call(**)
    described_class.call(**)
  end

  describe "busca" do
    it "sem query retorna todos os papéis" do
      create(:role, name: "Owner")
      create(:role, name: "Suporte")

      result = call

      expect(result.roles.count).to eq(2)
    end

    it "filtra por nome" do
      alvo = create(:role, name: "Suporte")
      create(:role, name: "Owner")

      result = call(query: "Suporte")

      expect(result.roles).to contain_exactly(alvo)
    end

    it "não diferencia maiúsculas de minúsculas" do
      alvo = create(:role, name: "Suporte")

      result = call(query: "suporte")

      expect(result.roles).to contain_exactly(alvo)
    end
  end

  describe "ordenação" do
    it "ordena por nome por padrão, ascendente" do
      create(:role, name: "Suporte")
      create(:role, name: "Owner")

      result = call

      expect(result.roles.map(&:name)).to eq(%w[Owner Suporte])
    end

    it "inverte a direção quando pedido" do
      create(:role, name: "Owner")
      create(:role, name: "Suporte")

      result = call(direction: "desc")

      expect(result.roles.map(&:name)).to eq(%w[Suporte Owner])
    end
  end

  describe "paginação" do
    it "pagina manualmente (limit/offset), sem gem" do
      4.times { |n| create(:role, name: "Papel#{n}") }

      result = call(page: 2, per_page: 2)

      expect(result.roles.count).to eq(2)
      expect(result.page).to eq(2)
      expect(result.total_count).to eq(4)
      expect(result.total_pages).to eq(2)
    end
  end
end
