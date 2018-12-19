module Actions
  module RecurringAction
    # When included sets the base action to use the RecurringLogic middleware and configures
    #   #trigger_repeat to be called when appropriate to trigger the next repeat.
    def self.included(base)
      base.middleware.use Actions::Middleware::RecurringLogic
      base.execution_plan_hooks.use :trigger_repeat, :on => [:planned, :failure]
    end

    # Hook to be called when a repetition needs to be triggered. This either happens when the plan goes into planned state
    #   or when it fails.
    def trigger_repeat(execution_plan)
      request_id = ::Logging.mdc['request']
      ::Logging.mdc['request'] = nil
      if execution_plan.delay_record && recurring_logic_task_group
        args = execution_plan.delay_record.args
        logic = recurring_logic_task_group.recurring_logic
        logic.trigger_repeat_after(task.start_at, self.class, *args)
      end
    ensure
      ::Logging.mdc['request'] = request_id
    end

    private

    def recurring_logic_task_group
      @task_group ||= task.task_groups
                          .find { |tg| tg.is_a? ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup }
    end
  end
end
