module ForemanTasks
  class TaskError < StandardError
    attr_reader :task
    attr_reader :errors

    def initialize(task)
      @task = task
      @errors = task.execution_plan.steps.values.map(&:error).compact
      super(aggregated_message)
    end

    def aggregated_message
      "Task #{task.id}: " +
        errors.map { |e| "#{e.exception_class}: #{e.message}" }.join('; ')
    end
  end
end
