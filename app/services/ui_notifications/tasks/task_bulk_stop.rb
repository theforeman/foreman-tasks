module UINotifications
  module Tasks
    class TaskBulkStop < ::UINotifications::Base
      def initialize(task, stopped_length, skipped_length)
        @subject = task
        @stopped_length = stopped_length
        @skipped_length = skipped_length
      end

      def create
        Notification.create!(
          initiator: initiator,
          audience: audience,
          subject: subject,
          notification_blueprint: blueprint,
          message: message,
          notification_recipients: [NotificationRecipient.create(:user => User.current)]
        )
      end

      def audience
        Notification::AUDIENCE_GLOBAL
      end

      def message
        ('%{stopped} Tasks were stopped. %{skipped} Tasks were already stopped. ' %
          { stopped: @stopped_length,
          skipped: @skipped_length })
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.find_by(name: 'tasks_bulk_stop')
      end
    end
  end
end
