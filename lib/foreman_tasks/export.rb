require 'dynflow/export'

module ForemanTasks
  class Export
    def initialize(world)
      @world = world
    end

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
      if task.is_a?(Task::DynflowTask)
        @dynflow_exporter ||= ::Dynflow::Export.new(@world)
        base[:execution_plan] = task.execution_plan && @dynflow_exporter.prepare_execution_plan(task.execution_plan)
      end
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

    def format_time(time)
      return unless time
      time.utc.iso8601
    end
  end
end
