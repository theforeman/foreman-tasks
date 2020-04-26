module UINotifications
  module Tasks
    class TaskBulkResume < ::UINotifications::Base
      def initialize(task, resumed_length, failed_length, skipped_length)
        @subject = task
        @resumed_length = resumed_length
        @failed_length = failed_length
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
        Notification::AUDIENCE_USER
      end

      def message
        ('%{resumed} Tasks were resumed. %{failed} Tasks failed to resume. %{skipped} Tasks were skipped. ' %
          { resumed: @resumed_length,
          failed: @failed_length,
          skipped: @skipped_length })
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.find_by(name: 'tasks_bulk_resume')
      end
    end
  end
end
