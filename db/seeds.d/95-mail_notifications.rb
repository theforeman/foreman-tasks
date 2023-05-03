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
                                     format_errors(created_notification))
    end
  end
end
