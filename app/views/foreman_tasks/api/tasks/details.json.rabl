object @task if @task

extends 'foreman_tasks/api/tasks/show'

attributes :parent_task_id, :start_at, :start_before, :external_id
node(:action) { @task.action }
node(:execution_plan) { { state: @task.execution_plan.state, cancellable: @task.execution_plan.cancellable? } }
node(:failed_steps) { @task.input_output_failed_steps }
node(:running_steps) { @task.input_output_running_steps }
node(:help) { troubleshooting_info_text }
node(:has_sub_tasks) { @task.sub_tasks.any? }

node(:locks) do
  @task.locks.map { |lock| partial('foreman_tasks/api/locks/show', :object => lock) }
end
node(:links) do
  @task.links.map { |link| partial('foreman_tasks/api/locks/show', :object => link, :locals => { :link => true }) }
end
node(:username_path) { username_link_task(@task.owner, @task.username) }
node(:dynflow_enable_console) { Setting['dynflow_enable_console'] }
node(:depends_on) do
  if @task.execution_plan
    dynflow_uuids = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(@task.execution_plan.id)
    ForemanTasks::Task.where(external_id: dynflow_uuids).map do |task|
      partial('foreman_tasks/api/tasks/dependency_summary', :object => task)
    end
  else
    []
  end
end
node(:blocks) do
  if @task.execution_plan
    dynflow_uuids = ForemanTasks.dynflow.world.persistence.find_blocked_execution_plans(@task.execution_plan.id)
    ForemanTasks::Task.where(external_id: dynflow_uuids).map do |task|
      partial('foreman_tasks/api/tasks/dependency_summary', :object => task)
    end
  else
    []
  end
end
