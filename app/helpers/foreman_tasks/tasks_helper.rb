module ForemanTasks
  module TasksHelper
    def format_task_input(humanized_input)
      Array(humanized_input).map do |part|
        if part.is_a? Array
          part[1][:text]
        else
          part.to_s
        end
      end.join('; ')
    end
  end
end
