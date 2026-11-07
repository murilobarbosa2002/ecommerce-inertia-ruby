require "rails_helper"

RSpec.describe "InertiaExample", type: :system, js: true do
  # FIXME: já apresentou timeout intermitente (Ferrum/Chrome headless) ao
  # rodar junto com a suíte completa via hook pre-push, mesmo passando
  # normalmente quando executado isolado. Causa raiz não identificada
  # ainda (indício de contenção de recurso/timing, não bug de lógica) —
  # investigar se persistir ou afetar outro system spec.
  it "renders the page title via React/Inertia" do
    visit root_path

    expect(page).to have_title("Ruby on Rails + Inertia + React")
  end
end
