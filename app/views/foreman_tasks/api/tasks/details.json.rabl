object @task if @task

extends 'foreman_tasks/api/tasks/show'

attributes :parent_task_id, :start_at, :start_before, :external_id
node(:action) { @task.action }
node(:execution_plan) { { state: @task.execution_plan.state, cancellable: @task.execution_plan.cancellable? } }
node(:failed_steps) { @task.input_output_failed_steps }
node(:running_steps) { @task.input_output_running_steps }
node(:help) { troubleshooting_info_text }
node(:has_sub_tasks) { @task.sub_tasks.any? }
node(:allowDangerousActions) { Setting['dynflow_allow_dangerous_actions'] }
node(:locks) do
  @task.locks.map do |lock|
    { name: lock.name, exclusive: lock.exclusive, resource_type: lock.resource_type, resource_id: lock.resource_id }
  end
end
node(:username_path) { username_link_task(@task.owner, @task.username) }
