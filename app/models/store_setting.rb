class StoreSetting < ApplicationRecord
  include ChangeReasonRequired
  tracked_by_change_reason :name

  has_one_attached :logo

  # Rails core não tem validador nativo pra content_type/tamanho de
  # attachment (confirmado via Context7 antes de escrever isso — só gems
  # terceiras como active_storage_validations têm; não adicionar uma gem
  # nova só pra isso) — validação explícita direto no blob.
  ALLOWED_LOGO_CONTENT_TYPES = %w[image/png image/jpeg image/svg+xml image/webp].freeze
  MAX_LOGO_SIZE = 2.megabytes

  validates :name, length: { maximum: 100 }
  # tracked_by_change_reason só exige change_reason quando :name muda — mas
  # logo (attachment do Active Storage) não é coluna rastreável por
  # PaperTrail. change_reason continua obrigatório mesmo quando só o logo
  # muda, sem alterar o nome (mesmo racional já aplicado em Role, #53).
  validates :change_reason, presence: true, length: { maximum: ChangeReasonRequired::MAX_LENGTH }, on: :update
  validate :logo_content_type_and_size, if: -> { logo.attached? }

  # Não usa first_or_create! — não há uma coluna natural de "find by" pra
  # um singleton. Seedado em db/seeds.rb; este fallback só importa se
  # alguém rodar a aplicação sem ter seedado (ex. banco antigo).
  def self.instance
    first || create!(change_reason: "Criação automática da configuração da loja")
  end

  private

  def logo_content_type_and_size
    unless ALLOWED_LOGO_CONTENT_TYPES.include?(logo.content_type)
      errors.add(:logo, :content_type_invalid)
    end

    if logo.byte_size > MAX_LOGO_SIZE
      errors.add(:logo, :file_size_too_big)
    end
  end
end
