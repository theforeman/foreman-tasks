module Actions
  module Middleware
    class RecurringLogic < ::Dynflow::Middleware
      # ::Actions::Middleware::RecurringLogic
      #
      # A middleware designed to make action repeatable.
      # After an action is delayed, it checks whether the delay_options
      # hash contains an id of a recurring logic. If so, it adds the task
      # to the recurring logic's task group, otherwise does nothing.
      def delay(delay_options, *args)
        pass(delay_options, *args).tap do
          if delay_options[:recurring_logic_id]
            task.add_missing_task_groups(recurring_logic(delay_options).task_group)
          end
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
