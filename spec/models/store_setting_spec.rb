require "rails_helper"

RSpec.describe StoreSetting, type: :model do
  describe ".instance" do
    it "cria a única linha na primeira chamada e devolve a mesma depois" do
      first_call = described_class.instance
      second_call = described_class.instance

      expect(first_call).to eq(second_call)
      expect(described_class.count).to eq(1)
    end
  end

  describe "singleton garantido no banco" do
    it "não permite uma segunda linha, mesmo direto no banco" do
      described_class.instance

      expect do
        described_class.connection.execute(
          "INSERT INTO store_settings (name, singleton_guard, created_at, updated_at) VALUES ('', true, now(), now())",
        )
      end.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe "change_reason" do
    it "exige change_reason ao atualizar só o name" do
      setting = described_class.instance
      setting.change_reason = nil

      setting.name = "Loja Teste"

      expect(setting).not_to be_valid
      expect(setting.errors[:change_reason]).to include("não pode ficar em branco")
    end

    it "exige change_reason ao atualizar só o logo (logo não é coluna rastreada por object_changes)" do
      setting = described_class.instance
      setting.change_reason = nil

      setting.logo.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/logo.png")),
        filename: "logo.png",
        content_type: "image/png",
      )

      expect(setting).not_to be_valid
      expect(setting.errors[:change_reason]).to include("não pode ficar em branco")
    end
  end

  describe "logo" do
    it "aceita um PNG dentro do limite de tamanho" do
      setting = described_class.instance
      setting.change_reason = "Logo novo"
      setting.logo.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/logo.png")),
        filename: "logo.png",
        content_type: "image/png",
      )

      expect(setting).to be_valid
    end

    it "rejeita content type que não seja imagem" do
      setting = described_class.instance
      setting.change_reason = "Logo inválido"
      setting.logo.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/not_an_image.txt")),
        filename: "not_an_image.txt",
        content_type: "text/plain",
      )

      expect(setting).not_to be_valid
      expect(setting.errors[:logo]).to include("precisa ser PNG, JPEG, SVG ou WebP")
    end

    it "rejeita arquivo maior que o limite" do
      setting = described_class.instance
      setting.change_reason = "Logo grande"
      # Arquivo real maior que o limite, gerado em memória — nunca
      # commitado como fixture (evita inflar o repositório com um
      # binário de alguns MB só pra este teste).
      oversized_io = StringIO.new("0" * (StoreSetting::MAX_LOGO_SIZE + 1))
      setting.logo.attach(
        io: oversized_io,
        filename: "logo-grande.png",
        content_type: "image/png",
      )

      expect(setting).not_to be_valid
      expect(setting.errors[:logo]).to include("não pode passar de 2MB")
    end
  end
end
