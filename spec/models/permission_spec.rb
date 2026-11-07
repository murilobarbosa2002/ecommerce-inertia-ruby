require "rails_helper"

RSpec.describe Permission, type: :model do
  describe "validações" do
    it { is_expected.to validate_presence_of(:key) }
    it { is_expected.to validate_presence_of(:description) }

    it "exige key única" do
      create(:permission, key: "duplicado")
      duplicado = build(:permission, key: "duplicado")

      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:key]).to include("já está em uso")
    end
  end
end
