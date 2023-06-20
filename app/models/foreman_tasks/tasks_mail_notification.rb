module ForemanTasks
  class TasksMailNotification < MailNotification
    ALL = N_("Subscribe")

    def subscription_options
      [ALL]
    end
  end
end
