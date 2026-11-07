# Replica o `comment_required` do gem Audited por cima do PaperTrail
# (docs/adr/0013) — PaperTrail não tem essa opção nativamente. Exige um
# motivo explícito em create/destroy e em update, mas só quando o update
# muda um dos atributos "editoriais" passados a `tracked_by_change_reason`
# — nunca em update que só toca atributo de estado operacional/automático
# (ex. failed_login_attempts, locked_at, otp_secret no Admin), que já é
# coberto pelo AuditEvent (evento de negócio, não CRUD) e não tem um
# "motivo" humano pra pedir. Motivo é armazenado em `versions.change_reason`
# via `meta:`.
module ChangeReasonRequired
  extend ActiveSupport::Concern

  MAX_LENGTH = 500

  class_methods do
    def tracked_by_change_reason(*attributes)
      attr_accessor :change_reason

      has_paper_trail only: attributes, meta: { change_reason: proc { |record| record.change_reason } }

      validates :change_reason, presence: true, length: { maximum: MAX_LENGTH }, on: :create
      validates :change_reason, presence: true, length: { maximum: MAX_LENGTH }, on: :update,
                if: -> { attributes.any? { |attribute| public_send(:"#{attribute}_changed?") } }

      before_destroy :require_change_reason_for_destroy
    end
  end

  private

  def require_change_reason_for_destroy
    return if change_reason.present?

    errors.add(:change_reason, :blank)
    throw :abort
  end
end
