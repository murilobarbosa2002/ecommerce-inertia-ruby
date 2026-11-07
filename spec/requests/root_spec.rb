require "rails_helper"

RSpec.describe "Root", type: :request do
  describe "GET /" do
    it "redirects to the admin login page" do
      get root_path

      expect(response).to redirect_to(new_admin_session_path)
    end
  end
end
