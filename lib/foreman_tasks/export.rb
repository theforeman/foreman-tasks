require 'dynflow/export'

module ForemanTasks
  class Export < ::Dynflow::Export
    def prepare_task(task)
      base = {
        id:               task.id,
        label:            task.label,
        started_at:       format_time(task.started_at),
        ended_at:         format_time(task.ended_at),
        state:            task.state,
        result:           task.result,
        external_id:      task.external_id,
        parent_task_id:   task.parent_task_id,
        action:           task.action,
        state_updated_at: format_time(task.state_updated_at),
        user_id:          task.user_id,
        sub_task_ids:     task.sub_tasks.pluck(:id),
        locks:            prepare_locks(task.locks),
      }
      base[:execution_plan] = task.execution_plan && prepare_execution_plan(task.execution_plan)
      base
    end

    def prepare_locks(locks)
      locks.map do |lock|
        {
          id: lock.id,
          name: lock.name,
          exclusive: lock.exclusive,
          resource_type: lock.resource_type,
          resource_id: lock.resource_id,
        }
      end
    end
  end
end
