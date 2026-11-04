module AdminTwoFactor
  class GenerateSecret
    def self.call(...)
      new(...).call
    end

    def initialize(admin:)
      @admin = admin
    end

    def call
      @admin.update!(otp_secret: ROTP::Base32.random)
      @admin
    end
  end
end
