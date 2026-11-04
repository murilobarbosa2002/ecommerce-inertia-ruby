module AdminAuthentication
  class ResetFailedLoginAttempts
    def self.call(...)
      new(...).call
    end

    def initialize(admin:)
      @admin = admin
    end

    def call
      @admin.update!(failed_login_attempts: 0, locked_at: nil)
    end
  end
end
