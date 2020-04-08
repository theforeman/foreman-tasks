object @task if @task

attributes :id, :label, :pending, :action
attributes :username, :started_at, :ended_at, :state, :result, :progress
attributes :input, :output, :humanized, :cli_example, :start_at
node(:available_actions) { |t| { cancellable: t.execution_plan&.cancellable?, resumable: t.resumable? } }
