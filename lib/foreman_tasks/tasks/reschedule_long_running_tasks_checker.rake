namespace :foreman_tasks do
  desc <<~DESC
    Reschedules the long running task checker recurring logic to run at a different schedule. ENV variables:

      * FOREMAN_TASKS_CHECK_LONG_RUNNING_TASKS_CRONLINE : A cron line describing the schedule, defaults to 0 0 * * *
  DESC
  task :reschedule_long_running_tasks_checker => ['environment', 'dynflow:client'] do
    User.as_anonymous_admin do
      task_class = Actions::CheckLongRunningTasks
      cronline = ENV['FOREMAN_TASKS_CHECK_LONG_RUNNING_TASKS_CRONLINE'] || '0 0 * * *'
      rl = ForemanTasks::RecurringLogic.joins(:tasks)
                                       .where(state: 'active')
                                       .merge(ForemanTasks::Task.where(label: task_class.name))
                                       .first
      if rl&.cron_line != cronline
        rl.cancel
        ForemanTasks.register_scheduled_task(task_class, cronline)
      end
    end
  end
end
