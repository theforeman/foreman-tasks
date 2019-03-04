module UINotifications
  module Tasks
    class TaskPausedOwner < Tasks::Base
      def deliver!
        notification = ::Notification.new(
          :audience => Notification::AUDIENCE_USER,
          :notification_blueprint => blueprint,
          :initiator => initiator,
          :message => message,
          :subject => subject
        )
        notification.send(:set_custom_attributes) # to add links from blueprint
        notification.actions['links'] ||= []
        if troubleshooting_help_generator
          notification.actions['links'].concat(troubleshooting_help_generator.links.map { |l| l.to_h(capitalize_title: true) })
        end
        notification.save!
        notification
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.unscoped.find_by(:name => 'tasks_paused_owner')
      end

      def message
        StringParser.new(blueprint.message, subject: subject.action).to_s
      end
    end
  end
end
