require "rails_helper"

RSpec.describe AdminAuthentication::AuthenticateWithPassword do
  describe ".call" do
    it "retorna o admin quando e-mail e senha estão corretos" do
      admin = create(:admin)

      result = described_class.call(email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD)

      expect(result).to eq(admin)
    end

    it "normaliza o e-mail antes de buscar (case e espaços)" do
      admin = create(:admin, email_address: "normalizado@example.com")

      result = described_class.call(
        email_address: "  NORMALIZADO@Example.com  ",
        password: AdminCredentials::VALID_PASSWORD
      )

      expect(result).to eq(admin)
    end

    it "retorna nil e registra login_failed quando o e-mail não existe" do
      result = nil

      expect do
        result = described_class.call(email_address: "inexistente@example.com", password: "qualquer-coisa")
      end.to change(AuditEvent, :count).by(1)

      expect(result).to be_nil
      expect(AuditEvent.last.event_type).to eq("login_failed")
      expect(AuditEvent.last.admin).to be_nil
    end

    it "retorna nil e incrementa tentativas quando a senha está errada" do
      admin = create(:admin)

      result = described_class.call(email_address: admin.email_address, password: "senha-errada")

      expect(result).to be_nil
      expect(admin.reload.failed_login_attempts).to eq(1)
    end

    it "zera as tentativas quando autentica com sucesso" do
      admin = create(:admin, failed_login_attempts: 3)

      described_class.call(email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD)

      expect(admin.reload.failed_login_attempts).to eq(0)
    end

    it "rejeita a conta bloqueada mesmo com a senha correta" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)

      result = described_class.call(email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD)

      expect(result).to be_nil
    end

    it "não incrementa tentativas numa conta já bloqueada" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: Time.current)

      described_class.call(email_address: admin.email_address, password: "senha-errada")

      expect(admin.reload.failed_login_attempts).to eq(5)
    end

    it "libera a conta depois que o bloqueio expira e autentica normalmente" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: 16.minutes.ago)

      result = described_class.call(email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD)

      expect(result).to eq(admin)
      expect(admin.reload.locked_at).to be_nil
      expect(admin.failed_login_attempts).to eq(0)
    end

    it "registra account_unlocked quando o bloqueio expirado é limpo" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: 16.minutes.ago)

      described_class.call(email_address: admin.email_address, password: AdminCredentials::VALID_PASSWORD)

      expect(AuditEvent.where(event_type: :account_unlocked, admin: admin)).to exist
    end

    it "não re-bloqueia imediatamente numa senha errada logo depois do bloqueio expirar" do
      admin = create(:admin, failed_login_attempts: 5, locked_at: 16.minutes.ago)

      described_class.call(email_address: admin.email_address, password: "senha-errada")

      expect(admin.reload.locked_at).to be_nil
      expect(admin.failed_login_attempts).to eq(1)
    end
  end
end
