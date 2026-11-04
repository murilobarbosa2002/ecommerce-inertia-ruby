require "rails_helper"

RSpec.describe Current do
  after { Current.reset }

  it "delega admin pra partir da admin_session atual" do
    admin = create(:admin)
    Current.admin_session = create(:admin_session, admin: admin)

    expect(Current.admin).to eq(admin)
  end

  it "retorna nil quando não há admin_session atual" do
    expect(Current.admin).to be_nil
  end
end
