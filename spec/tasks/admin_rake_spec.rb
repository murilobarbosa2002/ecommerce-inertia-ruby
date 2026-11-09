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
    before do
      role = Role.find_by(name: "owner")
      role&.assign_attributes(change_reason: "Removendo pra teste")
      role&.destroy!
    end

    it "não cria admin nenhum e sai com erro, sem tentar inventar a role" do
      expect { run_task }.to raise_error(RakeTaskExited).and change(Admin, :count).by(0)
      expect(Role.find_by(name: "owner")).to be_nil
    end
  end
end

RSpec.describe "admin:disable_two_factor", type: :task do
  subject(:run_task) { Rake::Task["admin:disable_two_factor"].invoke(admin.email_address) }

  let(:admin) { create(:admin, :with_two_factor_enabled) }

  it "desativa o 2FA e limpa os códigos de recuperação" do
    run_task

    admin.reload
    expect(admin.otp_required_for_login?).to be false
    expect(admin.otp_secret).to be_nil
    expect(admin.admin_recovery_codes).to be_empty
  end

  it "registra two_factor_disabled, sem performed_by_admin (acesso de shell, não sessão)" do
    run_task

    event = AuditEvent.last
    expect(event.event_type).to eq("two_factor_disabled")
    expect(event.admin).to eq(admin)
    expect(event.performed_by_admin).to be_nil
  end

  context "quando o e-mail não corresponde a nenhum admin" do
    subject(:run_task) { Rake::Task["admin:disable_two_factor"].invoke("inexistente@example.com") }

    it "sai com erro, sem alterar nenhum admin" do
      expect { run_task }.to raise_error(RakeTaskExited)
    end
  end

  context "quando o admin já está sem 2FA ativo" do
    let(:admin) { create(:admin) }

    it "sai com erro, sem tentar desativar de novo" do
      expect { run_task }.to raise_error(RakeTaskExited)
    end
  end
end
