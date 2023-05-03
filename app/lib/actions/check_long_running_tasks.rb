module Actions
  class CheckLongRunningTasks < ::Actions::EntryAction
    include Actions::RecurringAction

    INTERVAL = 2.days
    STATES = ['running', 'paused'].freeze

    def plan
      time = Time.now.utc
      cutoff = time - INTERVAL
      notification = ::ForemanTasks::TasksMailNotification.find_by(name: "long_running_tasks")
      users = User.where(id: UserMailNotification.where(mail_notification_id: notification.id))

      query = "state ^ (#{STATES.join(', ')}) AND state_updated_at <= \"#{cutoff}\""
      users.each do |user|
        User.as(user) do
          tasks = ForemanTasks::Task.authorized
                                    .search_for(query)
                                    .select(:id)
                                    .pluck(:id)
          plan_action(DeliverLongRunningTasksNotification,
                      OpenStruct.new(
                        user_id: User.current.id,
                        time: time,
                        interval: INTERVAL,
                        states: STATES,
                        task_uuids: tasks,
                        query: query,
                        # Non serializable fields
                        user: nil,
                        tasks: nil
                      ))
        end
      end
    end

    def humanized_name
      _('Check for long running tasks')
    end
  end
end
