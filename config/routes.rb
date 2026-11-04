Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root "inertia_example#index"
  get "inertia-example", to: "inertia_example#index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # module: "admin_panel" porque o model Admin (app/models/admin.rb) já ocupa
  # o nome Admin como classe — não pode também ser reaberto como módulo de
  # namespace. URL e route helpers continuam /admin/... e admin_session_path,
  # só a classe do controller muda pra AdminPanel::.
  namespace :admin, module: "admin_panel" do
    resource :session, only: %i[new create destroy], path: "login"
    # param: :token (não :id) porque o identificador do recurso é o token de
    # reset assinado (Admin#password_reset_token), não um ID de registro —
    # mesmo padrão do gerador real do Rails 8 (resources :passwords, param: :token).
    resources :passwords, param: :token, only: %i[new create edit update]
    # Verificação do código na hora do login (admin ainda não autenticado,
    # só provou a senha) — estado "pendente" fica em session[:pending_admin_id].
    resource :two_factor_authentication, only: %i[new create], path: "two-factor"
    # Configuração do 2FA em si (ativar/desativar) — exige admin já
    # autenticado, controller separado do de cima de propósito.
    resource :two_factor, only: %i[new create destroy], path: "two-factor-setup"
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
