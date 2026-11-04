require "rails_helper"

RSpec.describe AdminPanel::PasswordsMailer do
  describe "#reset" do
    let(:admin) { create(:admin) }
    let(:mail) { described_class.reset(admin) }

    it "envia pro e-mail do admin" do
      expect(mail.to).to eq([ admin.email_address ])
    end

    it "assunto está em pt-BR" do
      expect(mail.subject).to eq("Redefinição de senha")
    end

    it "inclui um link de reset cujo token resolve de volta pro admin" do
      token = mail.html_part.body.to_s[%r{/admin/passwords/([^/"]+)/edit}, 1]

      expect(token).to be_present
      expect(Admin.find_by_password_reset_token(token)).to eq(admin)
    end
  end
end
