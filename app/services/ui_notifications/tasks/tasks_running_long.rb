module UINotifications
  module Tasks
    class TasksRunningLong < Tasks::Base
      include Rails.application.routes.url_helpers

      def deliver!
        notification = ::Notification.new(
          :audience => Notification::AUDIENCE_GLOBAL,
          :notification_blueprint => blueprint,
          :initiator => initiator,
          :message => message,
          :subject => nil,
          :notification_recipients => [NotificationRecipient.create(:user => User.current)]
        )
        notification.actions['links'] ||= []
        notification.actions['links'] << {
          href: foreman_tasks_tasks_path(search: subject.query),
          title: N_('Long running tasks'),
        }
        notification.save!
        notification
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.unscoped.find_by(:name => 'tasks_running_long')
      end

      def message
        _("%{count} tasks are in running or paused state for more than a day") % { count: subject.task_uuids.count }
      end
    end
  end
end
