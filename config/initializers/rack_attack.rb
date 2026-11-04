class Rack::Attack
  # Throttle POST /admin/login por IP e por e-mail, combinados (não apenas um
  # dos dois) — ver docs/adr/0013. Mecanismo distinto do bloqueio de conta
  # (AdminAuthentication::RecordFailedLoginAttempt): throttle é só janela de
  # tempo, bloqueio é estado persistente da conta.
  throttle("admin/login/ip", limit: 10, period: 3.minutes) do |req|
    req.ip if req.path == "/admin/login" && req.post?
  end

  throttle("admin/login/email", limit: 5, period: 15.minutes) do |req|
    if req.path == "/admin/login" && req.post?
      req.params["email_address"].to_s.strip.downcase.presence
    end
  end

  # Evita spam de e-mail/enumeração de conta via POST /admin/passwords
  # (pedido de reset de senha) — ver docs/adr/0013.
  throttle("admin/passwords/email", limit: 5, period: 15.minutes) do |req|
    if req.path == "/admin/passwords" && req.post?
      req.params["email_address"].to_s.strip.downcase.presence
    end
  end
end
