module AuditEvents
  class RecordAuditEvent
    def self.call(...)
      new(...).call
    end

    def initialize(event_type:, request: nil, admin: nil, metadata: {})
      @event_type = event_type
      @request = request
      @admin = admin
      @metadata = metadata
    end

    def call
      AuditEvent.create!(
        event_type: @event_type,
        admin: @admin,
        ip_address: @request&.remote_ip,
        user_agent: @request&.user_agent,
        metadata: @metadata
      )
    end
  end
end
