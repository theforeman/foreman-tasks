module Actions
  class CheckLongRunningTasks < ::Actions::EntryAction
    include Actions::RecurringAction

    INTERVAL = 2.days
    STATES = ['running', 'paused'].freeze

    def plan
      time = Time.now.utc
      cutoff = time - INTERVAL
      users = User.joins(:mail_notifications)
                  .where(mail_enabled: true, mail_notifications: { name: 'long_running_tasks' })
                  .where.not(mail: [nil, ''])
                  .where(disabled: [nil, false])

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
