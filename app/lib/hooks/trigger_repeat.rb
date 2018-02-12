module Hooks
  class TriggerRepeat < ::Dynflow::ExecutionPlan::Hooks::Abstract
    def on_fail(execution_plan, action)
      if execution_plan.result == :error
        task_group = action.task
                           .task_groups
                           .find { |tg| tg.is_a? ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup }
        if task_group # A scheduled execution plan may have been a non-recurring one
          task_group.recurring_logic
                    .trigger_repeat_after(task.start_at,
                                          action.class,
                                          *execution_plan.delay_record.args)
        end
      end
    end
  end
end
