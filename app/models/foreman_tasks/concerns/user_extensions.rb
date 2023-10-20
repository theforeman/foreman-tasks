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
        return if ::ForemanSeeder.is_seeding

        org_admin_role = Role.find_by(name: 'Organization admin')
        admin_by_role = org_admin_role &&
                        (roles.map(&:id) & ([org_admin_role.id] + org_admin_role.cloned_role_ids)).any?

        return unless admin || admin_by_role

        notification = MailNotification.find_by(name: 'long_running_tasks')
        return if notification.nil?

        if user_mail_notifications.none? { |n| n.mail_notification_id == notification.id }
          user_mail_notifications.build(mail_notification_id: notification.id, interval: 'Subscribe')
        end
      end
    end
  end
end
