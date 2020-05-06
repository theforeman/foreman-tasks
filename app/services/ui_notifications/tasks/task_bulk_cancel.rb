module UINotifications
  module Tasks
    class TaskBulkCancel < ::UINotifications::Base
      def initialize(task, cancelled_length, skipped_length)
        @subject = task
        @cancelled_length = cancelled_length
        @skipped_length = skipped_length
      end

      def create
        Notification.create!(
          initiator: initiator,
          audience: audience,
          subject: subject,
          notification_blueprint: blueprint,
          message: message,
          notification_recipients: [NotificationRecipient.create({ :user => User.current })]
        )
      end

      def audience
        Notification::AUDIENCE_GLOBAL
      end

      def message
        ('%{cancelled} Tasks were cancelled. %{skipped} Tasks were skipped. ' %
          { cancelled: @cancelled_length,
          skipped: @skipped_length })
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.find_by(name: 'tasks_bulk_cancel')
      end
    end
  end
end
