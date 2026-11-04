require "rails_helper"

RSpec.describe "Admin::Sessions rate limiting", type: :request do
  describe "throttle por IP" do
    it "bloqueia a partir da 11ª tentativa de login na mesma janela" do
      10.times do |i|
        post admin_session_path, params: { email_address: "user#{i}@example.com", password: "qualquer-coisa" }
        expect(response).not_to have_http_status(:too_many_requests)
      end

      post admin_session_path, params: { email_address: "user10@example.com", password: "qualquer-coisa" }

      expect(response).to have_http_status(:too_many_requests)
    end
  end

  describe "throttle por e-mail" do
    it "bloqueia a partir da 6ª tentativa de login pro mesmo e-mail" do
      admin = create(:admin)

      5.times do
        post admin_session_path, params: { email_address: admin.email_address, password: "senha-errada" }
        expect(response).not_to have_http_status(:too_many_requests)
      end

      post admin_session_path, params: { email_address: admin.email_address, password: "senha-errada" }

      expect(response).to have_http_status(:too_many_requests)
    end
  end
end
