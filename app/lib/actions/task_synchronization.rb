module Actions
  # Examples:

  # # Action A which emits an event when it successfully finishes.
  # class A
  #   include ::Actions::ObservableAction
  #   # ... rest ...
  # end

  # # Action B which emits an event when it successfully finishes or fails.
  # class B
  #   include ::Actions::ObservableAction
  #
  #   execution_plan_hooks.use :emit_event_failure, :on => [:failure]
  #
  #   def self.event_names
  #     super + [event_name_base + '_' + event_name_suffix(:failure)]
  #   end
  #
  #   def emit_event_failure(plan)
  #     emit_event(plan, :failure)
  #   end
  #   # ... rest ...
  # end
  module TaskSynchronization
    def self.included(base)
      base.execution_plan_hooks.use :sync_execution_plan_to_task, on: ::Dynflow::ExecutionPlan.states
    end

    def sync_execution_plan_to_task(plan)
      return unless root_action?
      on_execution_plan_save(plan)
    rescue => e
      ::Foreman::Logging.exception('Error on on_execution_plan_save event', e,
                                   :logger => 'dynflow')
    end

    private

    def on_execution_plan_save(execution_plan)
      # We can load the data unless the execution plan was properly planned and saved
      # including its steps
      case execution_plan.state
      when :pending
        task = ForemanTasks::Task::DynflowTask.new_for_execution_plan(execution_plan)
        task.start_at ||= Time.zone.now
        task.save!
      when :scheduled
        delayed_plan = world.persistence.load_delayed_plan(execution_plan.id)
        raise ::Foreman::Exception, 'Plan is delayed but the delay record is missing' if delayed_plan.nil?
        task = ::ForemanTasks::Task::DynflowTask.find_by!(:external_id => execution_plan.id)
        task.update_from_dynflow(execution_plan, delayed_plan)
      when :planning
        task = ::ForemanTasks::Task::DynflowTask.where(:external_id => execution_plan.id).first
        task.update_from_dynflow(execution_plan)
      else
        if (task = ::ForemanTasks::Task::DynflowTask.where(:external_id => execution_plan.id).first)
          unless task.state.to_s == execution_plan.state.to_s
            task.update_from_dynflow(execution_plan)
          end
        end
      end
    end
  end
end
