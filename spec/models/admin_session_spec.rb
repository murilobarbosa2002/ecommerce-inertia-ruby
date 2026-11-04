require "rails_helper"

RSpec.describe AdminSession, type: :model do
  it { is_expected.to belong_to(:admin) }

  it "é destruída junto com o admin" do
    admin = create(:admin)
    create(:admin_session, admin: admin)

    expect { admin.destroy }.to change(AdminSession, :count).by(-1)
  end
end
