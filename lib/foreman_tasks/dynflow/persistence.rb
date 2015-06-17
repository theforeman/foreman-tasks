module ForemanTasks

  # wrap the dynflow persistence to reflect the changes to execution plan
  # in the Task model. This is probably a temporary solution and
  # Dynflow will probably get more events-based API but it should be enought
  # for start, until the requiements on the API are clear enough.
  class Dynflow::Persistence < ::Dynflow::PersistenceAdapters::Sequel

    def save_execution_plan(execution_plan_id, value)
      super.tap do
        begin
          on_execution_plan_save(execution_plan_id, value)
        rescue => e
          ForemanTasks.dynflow.world.logger.error('Error on on_execution_plan_save event')
          ForemanTasks.dynflow.world.logger.error(e.message)
          ForemanTasks.dynflow.world.logger.error(e.backtrace.join("\n"))
        end
      end
    ensure
      ::ActiveRecord::Base.clear_active_connections!
    end

    def on_execution_plan_save(execution_plan_id, data)
      # We can load the data unless the execution plan was properly planned and saved
      # including its steps
      if data[:state] == :planning
        task = ::ForemanTasks::Task::DynflowTask.new
        task.update_from_dynflow(data)
        Lock.owner!(::User.current, task.id) if ::User.current
      elsif data[:state] != :pending
        if task = ::ForemanTasks::Task::DynflowTask.find_by_external_id(execution_plan_id)
          unless task.state.to_s == data[:state].to_s
            task.update_from_dynflow(data)
          end
        end
      end
    end

  end
end
