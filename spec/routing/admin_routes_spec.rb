require "rails_helper"

RSpec.describe "Admin routes", type: :routing do
  # Regressão pro bug real documentado em docs/bugs/code-structure.md: trocar
  # `resource :session`/`resource :two_factor_authentication` por rotas
  # customizadas (pra tirar o "/new" de uma URL pública de login) quase
  # quebrou o nome dos helpers (`namespace` com `as:` explícito prefixa
  # "admin_" *antes* do nome dado, diferente de como `resource` nomeia).
  # Trava tanto o nome do helper quanto a URL pública final.
  it "new_admin_session_path aponta pra /admin/login, sem /new" do
    expect(new_admin_session_path).to eq("/admin/login")
    expect(get: "/admin/login").to route_to("admin_panel/sessions#new")
  end

  it "admin_session_path (create) continua em /admin/login" do
    expect(admin_session_path).to eq("/admin/login")
    expect(post: "/admin/login").to route_to("admin_panel/sessions#create")
  end

  it "/admin/login/new não existe mais" do
    expect(get: "/admin/login/new").not_to be_routable
  end

  it "new_admin_two_factor_authentication_path aponta pra /admin/two-factor, sem /new" do
    expect(new_admin_two_factor_authentication_path).to eq("/admin/two-factor")
    expect(get: "/admin/two-factor").to route_to("admin_panel/two_factor_authentications#new")
  end

  it "admin_two_factor_authentication_path (create) continua em /admin/two-factor" do
    expect(admin_two_factor_authentication_path).to eq("/admin/two-factor")
    expect(post: "/admin/two-factor").to route_to("admin_panel/two_factor_authentications#create")
  end

  it "/admin/two-factor/new não existe mais" do
    expect(get: "/admin/two-factor/new").not_to be_routable
  end
end
