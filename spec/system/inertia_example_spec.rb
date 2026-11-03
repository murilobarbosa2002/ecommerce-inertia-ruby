require "rails_helper"

RSpec.describe "InertiaExample", type: :system, js: true do
  it "renders the page title via React/Inertia" do
    visit root_path

    expect(page).to have_title("Ruby on Rails + Inertia + React")
  end
end
