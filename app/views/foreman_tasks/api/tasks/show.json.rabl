object @task if @task

attributes :id, :label, :pending, :action
attributes :username, :started_at, :ended_at, :state, :result, :progress
attributes :input, :output, :humanized, :cli_example, :execution_plan
node(:cancellable) { |t| t.execution_plan.cancellable? }
