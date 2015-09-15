module Actions
  module Middleware
    class RecurringLogic < ::Dynflow::Middleware

      # ::Actions::Middleware::RecurringLogic
      #
      # A middleware designed to make action repeatable.
      # After an action is delayed, it checks whether the delay_options
      # hash contains an id of a recurring logic. If so, it adds the task
      # to the recurring logic's task group, otherwise does nothing.
      #
      # After the action's plan phase the middleware checks if the task
      # is associated with a task group of any recurring logic, in which case
      # it triggers another repeat using the task group's recurring logic,
      # otherwise does nothing.
      def delay(delay_options, *args)
        pass(delay_options, *args).tap do
          if delay_options[:recurring_logic_id]
            task.add_missing_task_groups(recurring_logic(delay_options).task_group)
          end
        end
      end

      def plan(*args)
        pass(*args).tap do
          task_group = task.task_groups.find { |tg| tg.is_a? ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup }
          task_group.recurring_logic.trigger_repeat(action.class, *args) if task_group
        end
      end

      private

      def recurring_logic(delay_options)
        ForemanTasks::RecurringLogic.find(delay_options[:recurring_logic_id])
      end

      def task
        @task ||= action.task
      end
    end
  end
end
