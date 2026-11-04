require "rails_helper"

RSpec.describe AdminTwoFactor::GenerateRecoveryCodes do
  describe ".call" do
    it "gera 10 códigos únicos e retorna em texto puro" do
      admin = create(:admin)

      codes = described_class.call(admin: admin)

      expect(codes.size).to eq(10)
      expect(codes.uniq.size).to eq(10)
    end

    it "salva só o digest, nunca o código em texto puro" do
      admin = create(:admin)

      codes = described_class.call(admin: admin)

      stored_digests = admin.admin_recovery_codes.pluck(:code_digest)
      expect(stored_digests).not_to include(*codes)
      expect(stored_digests).to contain_exactly(*codes.map { |code| Digest::SHA256.hexdigest(code) })
    end

    it "descarta códigos antigos ao gerar novos" do
      admin = create(:admin)
      described_class.call(admin: admin)

      expect { described_class.call(admin: admin) }.not_to change(AdminRecoveryCode, :count)
      expect(admin.admin_recovery_codes.count).to eq(10)
    end
  end
end
