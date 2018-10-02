module ForemanTasks
  # Wrap the Dynflow persistence to reflect the changes to execution plan
  # in the Task model. This is probably a temporary solution and
  # Dynflow will probably get more events-based API but it should be enought
  # for start, until the requiements on the API are clear enough.
  class Dynflow::Persistence < ::Dynflow::PersistenceAdapters::Sequel
    def save_execution_plan(execution_plan_id, value)
      # clear connection only if not running in some active record transaction already
      clear_connections = ActiveRecord::Base.connection.open_transactions.zero?
      super.tap do
        begin
          on_execution_plan_save(execution_plan_id, value)
        rescue => e
          Foreman::Logging.exception('Error on on_execution_plan_save event', e,
                                     :logger => 'dynflow')
        end
      end
    ensure
      ::ActiveRecord::Base.clear_active_connections! if clear_connections
    end

    def on_execution_plan_save(execution_plan_id, data)
      # We can load the data unless the execution plan was properly planned and saved
      # including its steps
      case data[:state]
      when :pending
        task = ForemanTasks::Task::DynflowTask.new_for_execution_plan(execution_plan_id, data)
        task.start_at ||= Time.zone.now
        task.save!
      when :scheduled
        delayed_plan = load_delayed_plan(execution_plan_id)
        raise Foreman::Exception, 'Plan is delayed but the delay record is missing' if delayed_plan.nil?
        task = ::ForemanTasks::Task::DynflowTask.find_by!(:external_id => execution_plan_id)
        task.update_from_dynflow(data.merge(:start_at => delayed_plan[:start_at],
                                            :start_before => delayed_plan[:start_before]))
      when :planning
        task = ::ForemanTasks::Task::DynflowTask.where(:external_id => execution_plan_id).first
        task.update_from_dynflow(data)
      else
        if (task = ::ForemanTasks::Task::DynflowTask.where(:external_id => execution_plan_id).first)
          unless task.state.to_s == data[:state].to_s
            task.update_from_dynflow(data)
          end
        end
      end
    end
  end
end
