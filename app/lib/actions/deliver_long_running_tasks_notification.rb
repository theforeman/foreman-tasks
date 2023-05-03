module Actions
  class DeliverLongRunningTasksNotification < EntryAction
    def plan(report)
      return if report.task_uuids.empty?

      plan_self report: report
    end

    def run
      report = OpenStruct.new(input[:report])
      tasks = ForemanTasks::Task.where(id: report.task_uuids)
      report.user = User.current
      report.tasks = tasks
      TasksMailer.long_tasks(report).deliver_now
    end

    def humanized_name
      _('Deliver notifications about long running tasks')
    end
  end
end
