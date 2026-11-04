require "rails_helper"

RSpec.describe "Admin::Passwords rate limiting", type: :request do
  describe "throttle por e-mail" do
    it "bloqueia a partir da 6ª tentativa de pedido de reset pro mesmo e-mail" do
      admin = create(:admin)

      5.times do
        post admin_passwords_path, params: { email_address: admin.email_address }
        expect(response).not_to have_http_status(:too_many_requests)
      end

      post admin_passwords_path, params: { email_address: admin.email_address }

      expect(response).to have_http_status(:too_many_requests)
    end
  end
end
