object @task if @task

extends 'api/v2/layouts/permissions'

attributes :id, :label, :pending, :action
attributes :username, :started_at, :ended_at, :state, :result, :progress

# A workaround for https://github.com/ruby/json/issues/957
node(:duration) { |t| t.duration&.in_seconds&.to_s if t.respond_to?(:duration) }
attributes :input, :output, :humanized, :cli_example, :start_at
node(:available_actions) { |t| { cancellable: t.execution_plan&.cancellable?, resumable: t.resumable? } }
