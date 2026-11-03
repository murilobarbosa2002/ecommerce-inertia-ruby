require "rails_helper"

RSpec.describe "InertiaExample", type: :request do
  describe "GET /" do
    it "responds successfully" do
      get root_path

      expect(response).to have_http_status(:ok)
    end

    it "renders the Inertia root element" do
      get root_path

      expect(response.body).to include('id="app"')
    end
  end
end
