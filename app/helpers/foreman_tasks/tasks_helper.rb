module ForemanTasks
  module TasksHelper
    def format_task_input(task, include_action = false)
      parts = []
      parts << task.humanized[:action] if include_action
      parts << Array(task.humanized[:input]).map do |part|
        if part.is_a? Array
          part[1][:text]
        else
          part.to_s
        end
      end.join('; ')
      parts.join(" ")
    end
  end
end
