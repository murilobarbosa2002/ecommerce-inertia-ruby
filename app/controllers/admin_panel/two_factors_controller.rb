module AdminPanel
  class TwoFactorsController < AdminPanel::BaseController
    # Sem isso, um admin sem 2FA nunca conseguiria ativar o próprio 2FA
    # (docs/adr/0023) — create/destroy são as únicas mutações que um admin
    # sem 2FA precisa poder fazer.
    skip_before_action :require_two_factor_for_mutation, only: %i[create destroy]

    def new
      if Current.admin.otp_required_for_login?
        # Sem essa guarda, revisitar esta página com o 2FA já ativo
        # sobrescreveria o secret em uso silenciosamente — o app
        # autenticador do admin continuaria mostrando código pro secret
        # antigo, que nunca mais bateria, travando o login sem aviso.
        redirect_to root_path, alert: I18n.t("admin.two_factors.new.already_enabled")
        return
      end

      AdminTwoFactor::GenerateSecret.call(admin: Current.admin)
      render inertia: "Admin/TwoFactor/New", props: {
        provisioning_uri: provisioning_uri,
        qr_code_svg: qr_code_svg
      }
    end

    def create
      recovery_codes = AdminTwoFactor::EnableTwoFactor.call(
        admin: Current.admin, code: params[:otp_code], request: request
      )

      if recovery_codes
        # Códigos só existem neste retorno — nunca mais recuperáveis depois.
        render inertia: "Admin/TwoFactor/RecoveryCodes", props: { recovery_codes: recovery_codes }
      else
        redirect_to new_admin_two_factor_path, alert: I18n.t("admin.two_factors.create.invalid_code")
      end
    end

    def destroy
      if Current.admin.authenticate(params[:password])
        AdminTwoFactor::DisableTwoFactor.call(admin: Current.admin, request: request)
        redirect_to root_path, notice: I18n.t("admin.two_factors.destroy.success")
      else
        # Mesmo bloqueio de conta do login — sem isso, uma sessão roubada
        # (cookie vazado) poderia tentar adivinhar a senha sem limite pra
        # desativar o 2FA, já que esse endpoint exige sessão ativa, não
        # passa pelo fluxo de login nenhuma vez. event_type próprio
        # (reauthentication_failed, não login_failed) pra não misturar no
        # audit log uma reautenticação de ação sensível com tentativa de
        # login de verdade.
        AdminAuthentication::RecordFailedLoginAttempt.call(
          admin: Current.admin, request: request, event_type: :reauthentication_failed
        )
        redirect_to root_path, alert: I18n.t("admin.two_factors.destroy.invalid_password")
      end
    end

    private

    def provisioning_uri
      totp.provisioning_uri(Current.admin.email_address)
    end

    def qr_code_svg
      RQRCode::QRCode.new(provisioning_uri).as_svg(
        # standalone: true (padrão da gem) é o que de fato inclui a tag
        # <svg>...</svg> — com false, rqrcode devolve só o <path> cru, sem
        # elemento <svg> nenhum pra aplicar width/height/viewBox/
        # svg_attributes, e o navegador não renderiza nada visível (bug
        # real: docs/bugs/two-factor-authentication.md). viewbox: false (o
        # oposto do que estava antes) pelo mesmo motivo: sem width/height
        # explícitos, só viewBox, o <svg> solto (fora do alcance de classe
        # Tailwind, injetado via dangerouslySetInnerHTML) fica sem tamanho
        # garantido em todo navegador — width/height em pixel elimina essa
        # ambiguidade.
        use_path: true,
        module_size: 4,
        svg_attributes: { role: "img", "aria-label": I18n.t("admin.two_factors.new.qr_code_alt") }
      )
    end

    # issuer é o host da requisição, não um nome de marca fixo — o template é
    # white-label (docs/adr/0006), cada adoção/nicho tem seu próprio domínio.
    def totp
      ROTP::TOTP.new(Current.admin.otp_secret, issuer: request.host)
    end
  end
end
