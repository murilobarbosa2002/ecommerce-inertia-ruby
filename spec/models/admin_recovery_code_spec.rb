require "rails_helper"

RSpec.describe AdminRecoveryCode, type: :model do
  it { is_expected.to belong_to(:admin) }
  it { is_expected.to validate_presence_of(:code_digest) }

  it "exige code_digest único" do
    admin = create(:admin)
    create(:admin_recovery_code, admin: admin, code_digest: "duplicado")
    duplicado = build(:admin_recovery_code, admin: admin, code_digest: "duplicado")

    expect(duplicado).not_to be_valid
  end

  describe ".unused" do
    it "retorna só os códigos ainda não usados" do
      admin = create(:admin)
      usado = create(:admin_recovery_code, admin: admin, used_at: Time.current)
      nao_usado = create(:admin_recovery_code, admin: admin, used_at: nil)

      expect(AdminRecoveryCode.unused).to contain_exactly(nao_usado)
      expect(AdminRecoveryCode.unused).not_to include(usado)
    end
  end
end
