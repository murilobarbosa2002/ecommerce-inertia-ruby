require "rails_helper"

RSpec.describe "admin:create", type: :task do
  subject(:run_task) { Rake::Task["admin:create"].invoke }

  let(:email_address) { build(:admin).email_address }

  before do
    allow($stdin).to receive(:gets).and_return("#{email_address}\n")
    allow($stdin).to receive(:getpass).and_return(AdminCredentials::VALID_PASSWORD)
  end

  it "cria um admin com os dados digitados" do
    expect { run_task }.to change(Admin, :count).by(1)
    expect(Admin.last.email_address).to eq(email_address)
  end

  it "autentica com a senha digitada" do
    run_task

    expect(Admin.last.authenticate(AdminCredentials::VALID_PASSWORD)).to eq(Admin.last)
  end

  context "quando os dados são inválidos (ex. e-mail já existe)" do
    before { create(:admin, email_address: email_address) }

    it "não cria um segundo admin e sai com erro" do
      expect { run_task }.to raise_error(RakeTaskExited).and change(Admin, :count).by(0)
    end
  end
end
