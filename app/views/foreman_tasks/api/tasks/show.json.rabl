object @task if @task

extends 'api/v2/layouts/permissions'

attributes :id, :label, :pending, :action
attributes :username, :started_at, :ended_at, :duration, :state, :result, :progress
attributes :input, :output, :humanized, :cli_example, :start_at
node(:available_actions) { |t| { cancellable: t.execution_plan&.cancellable?, resumable: t.resumable? } }
