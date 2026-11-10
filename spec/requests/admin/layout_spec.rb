require "rails_helper"

# Layout aplicado em toda página (app/views/layouts/application.html.erb) —
# testado uma vez, numa página pública qualquer, não por página individual.
RSpec.describe "Layout", type: :request do
  it "declara o idioma da página (WCAG 3.1.1), consistente com I18n.default_locale" do
    get new_admin_session_path

    expect(response.body).to include(%(<html lang="#{I18n.locale}">))
  end
end
