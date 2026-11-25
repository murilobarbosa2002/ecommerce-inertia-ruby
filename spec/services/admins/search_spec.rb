require "rails_helper"

RSpec.describe Admins::Search do
  def call(**)
    described_class.call(**)
  end

  describe "busca" do
    it "sem query retorna todos os admins" do
      create(:admin, first_name: "Ana", last_name: "Souza", email_address: "ana@example.com")
      create(:admin, first_name: "Bruno", last_name: "Lima", email_address: "bruno@example.com")

      result = call

      expect(result.admins.count).to eq(2)
    end

    it "filtra por nome" do
      alvo = create(:admin, first_name: "Ana", last_name: "Souza")
      create(:admin, first_name: "Bruno", last_name: "Lima")

      result = call(query: "Ana")

      expect(result.admins).to contain_exactly(alvo)
    end

    it "filtra por sobrenome" do
      alvo = create(:admin, first_name: "Ana", last_name: "Souza")
      create(:admin, first_name: "Bruno", last_name: "Lima")

      result = call(query: "Souza")

      expect(result.admins).to contain_exactly(alvo)
    end

    it "filtra por e-mail" do
      alvo = create(:admin, email_address: "owner-da-loja@example.com")
      create(:admin, email_address: "outro@example.com")

      result = call(query: "owner-da-loja")

      expect(result.admins).to contain_exactly(alvo)
    end

    it "filtra pelo nome do papel" do
      papel_suporte = create(:role, name: "Suporte")
      papel_owner = create(:role, name: "Owner")
      alvo = create(:admin, role: papel_suporte)
      create(:admin, role: papel_owner)

      result = call(query: "Suporte")

      expect(result.admins).to contain_exactly(alvo)
    end

    it "não diferencia maiúsculas de minúsculas" do
      alvo = create(:admin, first_name: "Ana")

      result = call(query: "ANA")

      expect(result.admins).to contain_exactly(alvo)
    end

    it "escapa caractere curinga do ILIKE (% e _) digitado na busca" do
      create(:admin, first_name: "Ana")

      result = call(query: "%")

      expect(result.admins).to be_empty
    end
  end

  describe "ordenação" do
    it "ordena por nome por padrão, ascendente" do
      create(:admin, first_name: "Bruno")
      create(:admin, first_name: "Ana")

      result = call

      expect(result.admins.map(&:first_name)).to eq(%w[Ana Bruno])
    end

    it "ordena por e-mail quando pedido" do
      create(:admin, email_address: "b@example.com")
      create(:admin, email_address: "a@example.com")

      result = call(sort: "email_address")

      expect(result.admins.map(&:email_address)).to eq(%w[a@example.com b@example.com])
    end

    it "inverte a direção quando pedido" do
      create(:admin, first_name: "Ana")
      create(:admin, first_name: "Bruno")

      result = call(direction: "desc")

      expect(result.admins.map(&:first_name)).to eq(%w[Bruno Ana])
    end

    it "ignora uma chave de ordenação desconhecida, caindo no padrão (nome)" do
      create(:admin, first_name: "Bruno")
      create(:admin, first_name: "Ana")

      result = call(sort: "coluna-que-nao-existe")

      expect(result.admins.map(&:first_name)).to eq(%w[Ana Bruno])
    end
  end

  describe "paginação" do
    it "pagina manualmente (limit/offset), sem gem" do
      4.times { |n| create(:admin, first_name: "Admin#{n}") }

      result = call(page: 2, per_page: 2)

      expect(result.admins.count).to eq(2)
      expect(result.page).to eq(2)
      expect(result.total_count).to eq(4)
      expect(result.total_pages).to eq(2)
    end

    it "nunca aceita página menor que 1" do
      create(:admin)

      result = call(page: 0)

      expect(result.page).to eq(1)
    end
  end
end
