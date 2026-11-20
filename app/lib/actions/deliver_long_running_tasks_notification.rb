module Actions
  class DeliverLongRunningTasksNotification < EntryAction
    def plan(report)
      return if report.task_uuids.empty?

      plan_self report: report
    end

    def run
      report = OpenStruct.new(input[:report])
      user = User.unscoped.with_enabled_email.find_by(id: report.user_id)
      return unless user

      report.user = user
      report.tasks = ForemanTasks::Task.where(id: report.task_uuids)
      ::UINotifications::Tasks::TasksRunningLong.new(report).deliver!
      TasksMailer.long_tasks(report).deliver_now
    end

    def humanized_name
      _('Deliver notifications about long running tasks')
    end

    def rescue_strategy_for_self
      ::Dynflow::Action::Rescue::Skip
    end
  end
end
