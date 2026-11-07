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

  describe "change_reason (audit de CRUD via PaperTrail, docs/adr/0013)" do
    it "exige change_reason na criação" do
      admin = build(:admin, change_reason: nil)

      expect(admin).not_to be_valid
      expect(admin.errors[:change_reason]).to include("não pode ficar em branco")
    end

    it "exige change_reason ao atualizar email_address (campo editorial)" do
      admin = create(:admin)

      admin.change_reason = nil
      admin.email_address = "novo-email@example.com"

      expect(admin).not_to be_valid
      expect(admin.errors[:change_reason]).to include("não pode ficar em branco")
    end

    it "não exige change_reason ao atualizar um campo de estado operacional (ex. failed_login_attempts)" do
      admin = create(:admin)
      admin.change_reason = nil

      expect { admin.update!(failed_login_attempts: 1) }.not_to raise_error
    end

    it "cria uma versão do PaperTrail com o change_reason preenchido ao atualizar email_address" do
      admin = create(:admin)

      expect do
        admin.update!(email_address: "novo-email@example.com", change_reason: "Correção de digitação")
      end.to change(PaperTrail::Version, :count).by(1)

      expect(admin.versions.last.change_reason).to eq("Correção de digitação")
    end

    it "não cria versão do PaperTrail ao atualizar só um campo de estado operacional" do
      admin = create(:admin)
      admin.change_reason = nil

      expect { admin.update!(failed_login_attempts: 1) }.not_to change(PaperTrail::Version, :count)
    end

    it "permite reverter pra versão anterior do email_address" do
      admin = create(:admin, email_address: "original@example.com")
      admin.update!(email_address: "alterado@example.com", change_reason: "Teste de reversão")

      revertido = admin.paper_trail.previous_version

      expect(revertido.email_address).to eq("original@example.com")
    end

    it "exige change_reason pra destruir" do
      admin = create(:admin)
      admin.change_reason = nil

      expect(admin.destroy).to be false
      expect(admin.errors[:change_reason]).to include("não pode ficar em branco")
    end

    it "permite destruir com change_reason preenchido" do
      admin = create(:admin)
      admin.change_reason = "Conta não é mais necessária"

      expect(admin.destroy).to eq(admin)
    end

    it "não destrói sessões associadas quando o destroy é abortado por falta de change_reason" do
      admin = create(:admin)
      create(:admin_session, admin: admin)
      admin.change_reason = nil

      admin.destroy

      expect(Admin.exists?(admin.id)).to be true
      expect(admin.admin_sessions.count).to eq(1)
    end
  end
end
