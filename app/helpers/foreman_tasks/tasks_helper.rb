module ForemanTasks
  module TasksHelper
    def format_task_input(task)
      return '-' unless task

      task.action
    end

    def format_recurring_logic_limit(thing)
      if thing.nil?
        content_tag(:i, N_('Unlimited'))
      else
        thing
      end
    end
  end
end
