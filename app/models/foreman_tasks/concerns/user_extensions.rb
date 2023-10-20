module ForemanTasks
  module Concerns
    module UserExtensions
      extend ActiveSupport::Concern

      included do
        # rubocop:disable Rails/ReflectionClassName
        has_many :tasks, :dependent => :nullify,
                         :class_name => ::ForemanTasks::Task.name
        # rubocop:enable Rails/ReflectionClassName

        before_validation :attach_task_mail_notifications, on: :create
      end

      def attach_task_mail_notifications
        org_admin_role = Role.find_by(name: 'Organization admin')
        admin_role_ids = ([org_admin_role.id] + org_admin_role.cloned_role_ids)
        role_ids = roles.map(&:id)

        return unless admin || (role_ids & admin_role_ids).any?

        notification = MailNotification.find_by(name: 'long_running_tasks')
        return if notification.nil?

        if user_mail_notifications.none? { |n| n.mail_notification_id == notification.id }
          user_mail_notifications.build(mail_notification_id: notification.id, interval: 'Subscribe')
        end
      end
    end
  end
end
