module AdminPanel
  class StoreSettingsController < AdminPanel::BaseController
    require_permission :manage_store_settings

    def edit
      setting = StoreSetting.instance
      render inertia: "Admin/StoreSettings/Edit", props: {
        name: setting.name,
        logo_url: setting.logo.attached? ? url_for(setting.logo) : nil
      }
    end

    def update
      setting = StoreSetting.instance

      if setting.update(store_setting_params)
        # Sempre, independente de name e/ou logo terem mudado — logo não é
        # atributo rastreado por object_changes do PaperTrail (não é uma
        # coluna), então este é o único rastro estruturado que diz QUAL
        # campo mudou (ver app/models/audit_event.rb e
        # spec/requests/admin/store_settings_spec.rb pra como isso
        # interage com o touch automático do Active Storage).
        AuditEvents::RecordAuditEvent.call(
          event_type: :store_settings_updated,
          request: request,
          metadata: { change_reason: setting.change_reason }
        )
        redirect_to edit_admin_store_setting_path, notice: I18n.t("admin.store_settings.update.success")
      else
        redirect_to edit_admin_store_setting_path, alert: setting.errors.full_messages.to_sentence
      end
    end

    private

    def store_setting_params
      permitted = params.permit(:name, :change_reason, :logo).to_h.symbolize_keys
      # Campo de arquivo vazio (nenhum arquivo novo escolhido) não deve
      # apagar o logo já existente — só substitui quando um arquivo de
      # verdade é enviado.
      permitted.delete(:logo) if params[:logo].blank?
      permitted
    end
  end
end
