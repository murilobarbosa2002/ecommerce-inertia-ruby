require "rails_helper"

RSpec.describe Admin, type: :model do
  describe "validações" do
    it { is_expected.to validate_presence_of(:email_address) }

    it "exige e-mail único" do
      existing_email_address = build(:admin).email_address
      create(:admin, email_address: existing_email_address)
      duplicado = build(:admin, email_address: existing_email_address)

      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:email_address]).to include("já está em uso")
    end

    it "considera e-mails com case diferente como duplicados" do
      create(:admin, email_address: "duplicado@example.com")
      duplicado = build(:admin, email_address: "DUPLICADO@Example.com")

      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:email_address]).to include("já está em uso")
    end

    it "rejeita e-mail acima do limite do RFC 5321 (254 caracteres)" do
      email_muito_longo = "#{'a' * 250}@a.co"
      admin = build(:admin, email_address: email_muito_longo)

      expect(admin).not_to be_valid
      expect(admin.errors[:email_address]).to include("é muito longo (máximo: 254 caracteres)")
    end
  end

  describe "normalização de e-mail" do
    it "remove espaços e converte pra minúsculo" do
      admin = create(:admin, email_address: "  MAIUSCULO@Example.com  ")

      expect(admin.email_address).to eq("maiusculo@example.com")
    end
  end

  describe "has_secure_password" do
    it "autentica com a senha correta" do
      admin = create(:admin)

      expect(admin.authenticate(AdminCredentials::VALID_PASSWORD)).to eq(admin)
    end

    it "não autentica com senha errada" do
      admin = create(:admin)

      expect(admin.authenticate("senha-errada")).to be false
    end

    it "nunca persiste a senha em texto puro" do
      admin = create(:admin)

      expect(admin.password_digest).not_to eq(AdminCredentials::VALID_PASSWORD)
      expect(admin.password_digest).to start_with("$2a$")
    end

    it "rejeita senha maior que os 72 bytes aceitos pelo bcrypt, com mensagem em pt-BR" do
      admin = build(:admin, password: "a" * 100, password_confirmation: "a" * 100)

      expect(admin).not_to be_valid
      expect(admin.errors.full_messages).to include("Senha é muito longa")
    end

    it "traduz a mensagem de confirmação de senha não coincidente" do
      admin = build(:admin, password: AdminCredentials::VALID_PASSWORD, password_confirmation: "diferente")

      expect(admin).not_to be_valid
      expect(admin.errors.full_messages).to include("Confirmação de senha não é igual a Senha")
    end
  end
end
