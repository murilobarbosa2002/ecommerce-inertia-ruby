require "rails_helper"

RSpec.describe Role, type: :model do
  describe "validações" do
    it { is_expected.to validate_presence_of(:name) }

    it "exige nome único" do
      create(:role, name: "duplicado")
      duplicado = build(:role, name: "duplicado")

      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:name]).to include("já está em uso")
    end
  end

  describe "#permission?" do
    it "retorna true quando a role tem a permissão" do
      permission = create(:permission, key: "manage_admins")
      role = create(:role)
      role.permissions << permission

      expect(role.permission?("manage_admins")).to be true
      expect(role.permission?(:manage_admins)).to be true
    end

    it "retorna false quando a role não tem a permissão" do
      role = create(:role)

      expect(role.permission?("manage_admins")).to be false
    end
  end

  describe "exclusão" do
    it "impede apagar uma role ainda atribuída a um admin" do
      role = create(:role)
      create(:admin, role: role)

      expect { role.destroy }.not_to change(Role, :count)
      expect(role.errors[:base]).to be_present
    end
  end
end
