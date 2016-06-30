object @task if @task

attributes :id

node :phases do |task|
  ForemanTasks::ExecutionPlanPresenter.new(task).plan
end
