Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  # Sem loja pública ainda (ver docs/adr/0013) — root serve o dashboard do
  # painel direto. AdminPanel::Authentication (before_action padrão de
  # AdminPanel::BaseController) já redireciona pro login sozinho quando não
  # autenticado, sem precisar de lógica própria aqui.
  root to: "admin_panel/dashboards#show"

  # module: "admin_panel" porque o model Admin (app/models/admin.rb) já ocupa
  # o nome Admin como classe — não pode também ser reaberto como módulo de
  # namespace. URL e route helpers continuam /admin/... e admin_session_path,
  # só a classe do controller muda pra AdminPanel::.
  # `scope` (não `namespace`) pras rotas de login/2FA de propósito: dentro de
  # `namespace :admin`, a opção `as:` de uma rota é sempre prefixada com
  # "admin_" *na frente* do nome dado (`as: :new_session` vira
  # `admin_new_session`, não `new_admin_session`) — incompatível com o nome
  # de helper que `resource :session` gerava (`new_admin_session_path`,
  # "new_" antes do namespace). `scope` não prefixa nome nenhum sozinho,
  # permitindo escrever o nome final exato via `as:`.
  scope path: "admin", module: "admin_panel" do
    # Rotas customizadas em vez de `resource :session` — um `resource`
    # singular com `only: %i[new create destroy]` gera `/admin/login/new`
    # pro formulário, o que não faz sentido numa URL pública de login.
    get "login", to: "sessions#new", as: :new_admin_session
    post "login", to: "sessions#create", as: :admin_session
    delete "login", to: "sessions#destroy"

    # Verificação do código na hora do login (admin ainda não autenticado,
    # só provou a senha) — estado "pendente" fica em session[:pending_admin_id].
    # Mesmo racional das rotas de login acima: sem `/new` na URL pública.
    get "two-factor", to: "two_factor_authentications#new", as: :new_admin_two_factor_authentication
    post "two-factor", to: "two_factor_authentications#create", as: :admin_two_factor_authentication
  end

  namespace :admin, module: "admin_panel" do
    # param: :token (não :id) porque o identificador do recurso é o token de
    # reset assinado (Admin#password_reset_token), não um ID de registro —
    # mesmo padrão do gerador real do Rails 8 (resources :passwords, param: :token).
    resources :passwords, param: :token, only: %i[new create edit update]

    # Configuração do 2FA em si (ativar/desativar) — exige admin já
    # autenticado, controller separado do de cima de propósito. Fica como
    # `resource` (não é uma URL de entrada pública como login/2FA de login).
    resource :two_factor, only: %i[new create destroy], path: "two-factor-setup"

    # Gerenciar admins (listar/criar/editar) — gated por require_permission
    # :manage_admins (docs/adr/0021). Primeiro consumidor real da permissão;
    # AdminPanel::AuthorizationTestController (controller fictício só de
    # teste) não é mais necessário a partir daqui.
    resources :admins, only: %i[index new create edit update]

    # Perfil do próprio admin autenticado (trocar senha) — singular, não tem
    # :id porque é sempre o Current.admin, nunca outro registro.
    resource :profile, only: %i[show update]
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
