require "rails_helper"

RSpec.describe "admin:create", type: :task do
  subject(:run_task) { Rake::Task["admin:create"].invoke }

  let(:email_address) { build(:admin).email_address }
  let(:change_reason) { "Primeiro admin do sistema" }

  before do
    # Vem de db/seeds.rb em produção (docs/adr/0021) — a task recusa criar
    # admin sem essa role existir, então o spec precisa garantir que existe.
    create(:role, name: "owner")
    allow($stdin).to receive(:gets).and_return("#{email_address}\n", "#{change_reason}\n")
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

  it "registra o motivo digitado na versão do PaperTrail" do
    run_task

    expect(Admin.last.versions.last.change_reason).to eq(change_reason)
  end

  context "quando os dados são inválidos (ex. e-mail já existe)" do
    before { create(:admin, email_address: email_address) }

    it "não cria um segundo admin e sai com erro" do
      expect { run_task }.to raise_error(RakeTaskExited).and change(Admin, :count).by(0)
    end
  end

  context "quando a role \"owner\" não existe (banco sem bin/rails db:seed)" do
    before { Role.find_by(name: "owner")&.destroy! }

    it "não cria admin nenhum e sai com erro, sem tentar inventar a role" do
      expect { run_task }.to raise_error(RakeTaskExited).and change(Admin, :count).by(0)
      expect(Role.find_by(name: "owner")).to be_nil
    end
  end
end
