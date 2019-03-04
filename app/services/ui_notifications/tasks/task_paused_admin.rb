module UINotifications
  module Tasks
    class TaskPausedAdmin < Tasks::Base
      def deliver!
        # delete previous notifications about paused tasks first
        Notification.where(notification_blueprint_id: blueprint.id).each(&:destroy)
        notification = ::Notification.new(
          :audience => Notification::AUDIENCE_ADMIN,
          :notification_blueprint => blueprint,
          :initiator => initiator,
          :subject => subject,
          :message => message
        )

        notification.send(:set_custom_attributes) # to add links from blueprint
        notification.actions['links'] ||= []
        if troubleshooting_help_generator
          troubleshooting_link = troubleshooting_help_generator.troubleshooting_link(generic_only: true)
          notification.actions['links'] << troubleshooting_link.to_h(capitalize_title: true) if troubleshooting_link
        end
        notification.save!
        notification
      end

      def initiator
        User.anonymous_admin
      end

      def blueprint
        @blueprint ||= NotificationBlueprint.unscoped.find_by(:name => 'tasks_paused_admin')
      end

      def message
        return @message if @message

        tasks_count = ForemanTasks::Task.where(state: 'paused').count
        @message = n_('There is %{count} paused task in the system that need attention',
                      'There are %{count} paused tasks in the system that need attention',
                      tasks_count) % { count: tasks_count }
      end
    end
  end
end
