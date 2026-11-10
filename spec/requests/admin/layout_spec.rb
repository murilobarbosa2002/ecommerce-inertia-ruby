require "rails_helper"

# Layout aplicado em toda página (app/views/layouts/application.html.erb) —
# testado uma vez, numa página pública qualquer, não por página individual.
RSpec.describe "Layout", type: :request do
  it "declara o idioma da página (WCAG 3.1.1), consistente com I18n.default_locale" do
    get new_admin_session_path

    expect(response.body).to include(%(<html lang="#{I18n.locale}">))
  end

  # Regressão real: o comentário ERB (<%# ... %>) logo acima tinha uma tag
  # de saída (<%= I18n.locale %>) escrita dentro dele como exemplo — ERB
  # fecha o comentário no primeiro %> que encontrar, mesmo vindo de uma tag
  # aninhada, derramando o resto do texto do comentário como HTML cru na
  # página. Isso quebrava o <script> de tema logo em seguida (o texto cru
  # abria uma tag <script> falsa, cujo conteúdo virava texto solto em
  # português — ver docs/bugs/code-structure.md), deixando o dark mode sem
  # efeito no primeiro paint silenciosamente, sem erro nenhum do lado do
  # servidor.
  it "renderiza o <head> começando direto no <script> de tema, sem texto de comentário vazado" do
    get new_admin_session_path

    expect(response.body).not_to match(/antes do primeiro paint/)
    expect(response.body).to match(%r{<head>\s*<script>\s*\(function \(\) \{})
  end
end
