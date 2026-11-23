module AdminPanel
  class QuickActionsController < AdminPanel::BaseController
    # Sem require_permission: é uma preferência pessoal do próprio
    # Current.admin (igual ProfilesController), não uma ação sobre outro
    # admin/recurso — toda autenticação já é exigida pelo
    # AdminPanel::Authentication incluído em BaseController.
    def update
      # Catálogo de chaves válidas (o que cada uma significa, se exige
      # permissão) vive só no frontend (app/frontend/config/quickActions.ts)
      # — o backend não valida contra ele de propósito: uma chave
      # desconhecida/obsoleta salva aqui é inofensiva, só nunca casa com
      # nada no catálogo e é ignorada na exibição. Só garante o formato
      # (array de string), não o conteúdo.
      Current.admin.update!(quick_action_keys: quick_action_keys_param)
      redirect_to root_path, notice: I18n.t("admin.quick_actions.update.success")
    end

    private

    def quick_action_keys_param
      # compact_blank: um array vazio enviado por um form HTML real (sem
      # nenhum checkbox marcado) chega ao Rails como `[""]` (um elemento
      # string vazia), não `[]` — a forma padrão de representar "nenhum
      # valor" num campo múltiplo via x-www-form-urlencoded/multipart.
      # Sem isso, uma string vazia ficaria salva como chave válida.
      params.permit(quick_action_keys: []).fetch(:quick_action_keys, []).compact_blank
    end
  end
end
