module Hooks
  class TriggerRepeat < ::Dynflow::ExecutionPlan::Hooks::Abstract
    # When the execution plan goes into the planned state, this hook checks if
    # this hook checks if the task is associated with a task group of any
    # recurring logic, in which case it triggers another repeat using the task
    # group's recurring logic, otherwise does nothing
    def on_planned(_execution_plan, action)
      task_group = recurring_logic_task_group(action)
      task_group.recurring_logic.trigger_repeat(action.class, *args) if task_group
    end

    # Behaves similarly as #on_planned, but needs the execution plan to go into
    # the stopped state with error, warning or cancelled result to be triggered.
    def on_failure(execution_plan, action)
      if execution_plan.result == :error
        task_group = recurring_logic_task_group(action)
        if task_group # A scheduled execution plan may have been a non-recurring one
          task_group.recurring_logic
                    .trigger_repeat_after(action.task.start_at,
                                          action.class,
                                          *execution_plan.delay_record.args)
        end
      end
    end

    private

    def recurring_logic_task_group(action)
      @task_group ||= action.task
                            .task_groups
                            .find { |tg| tg.is_a? ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup }
    end
  end
end
