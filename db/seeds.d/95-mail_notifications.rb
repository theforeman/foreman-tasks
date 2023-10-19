N_('Long running tasks')

notifications = [
  {
    :name               => 'long_running_tasks',
    :description        => N_('A notification when tasks run for suspiciously long time'),
    :mailer             => 'TasksMailer',
    :method             => 'long_tasks',
    :subscription_type  => 'alert',
  },
]

notifications.each do |notification|
  if (mail = ForemanTasks::TasksMailNotification.find_by(name: notification[:name]))
    mail.attributes = notification
    mail.save! if mail.changed?
  else
    created_notification = ForemanTasks::TasksMailNotification.create(notification)
    if created_notification.nil? || created_notification.errors.any?
      raise ::Foreman::Exception.new(N_("Unable to create mail notification: %s"),
                                     SeedHelper.format_errors(created_notification))
    end

    org_admin_role = Role.find_by(name: 'Organization admin')

    users = User.left_joins(:roles)
                .joins(:auth_source)
                .where(admin: true)
                .or(User.where(id: UserRole.where(id: [org_admin_role.id] + org_admin_role.cloned_role_ids).select(:owner_id)))
                .where.not(auth_source: { name: 'Hidden' })
    users.each do |user|
      mail = UserMailNotification.create(mail_notification_id: created_notification.id, user_id: user.id, interval: 'Subscribe')
      if mail.nil? || mail.errors.any?
        raise ::Foreman::Exception.new(N_("Unable to enable mail notification to user '%s': %s"), user.login, SeedHelper.format_errors(mail))
      end
    end
  end
end
