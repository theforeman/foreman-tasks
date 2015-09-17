module ForemanTasks
  class Task::TaskCancelledException < ::Foreman::Exception
    def backtrace
      []
    end
  end
end
