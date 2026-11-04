module AdminTwoFactor
  class GenerateRecoveryCodes
    CODE_COUNT = 10

    def self.call(...)
      new(...).call
    end

    def initialize(admin:)
      @admin = admin
    end

    # Retorna os códigos em texto puro — só existem neste retorno, nunca mais
    # recuperáveis depois (só o digest fica salvo). Quem chama é responsável
    # por mostrar isso ao admin uma única vez.
    def call
      @admin.admin_recovery_codes.destroy_all

      plain_codes = Array.new(CODE_COUNT) { SecureRandom.alphanumeric(10) }
      plain_codes.each { |code| @admin.admin_recovery_codes.create!(code_digest: digest(code)) }
      plain_codes
    end

    private

    # SHA-256 simples, não bcrypt: código de recuperação é token aleatório de
    # alta entropia gerado pelo servidor (SecureRandom), não senha escolhida
    # por humano — não precisa do custo computacional do bcrypt, que existe
    # pra dificultar força bruta contra segredos curtos/previsíveis de gente.
    def digest(code)
      Digest::SHA256.hexdigest(code)
    end
  end
end
