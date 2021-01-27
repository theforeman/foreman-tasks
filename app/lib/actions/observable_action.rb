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
  module ObservableAction
    module ClassMethods
      def event_name_suffix(hook)
        case hook
        when :success
          'succeeded'
        when :failure
          'failed'
        else
          hook
        end
      end

      def event_names
        [event_name_base + '_' + event_name_suffix(:success)]
      end

      def namespaced_event_names
        event_names.map { |e| ::Foreman::Observable.event_name_for(e) }
      end

      def event_name_base
        to_s.underscore.tr('/', '.')
      end
    end

    def self.included(base)
      base.extend ClassMethods
      base.include ::Foreman::Observable
      base.execution_plan_hooks.use :emit_event, :on => :success
    end

    def emit_event(execution_plan, hook = :success)
      return unless root_action?

      trigger_hook "#{self.class.event_name_base}_#{event_name_suffix(hook)}",
                   payload: event_payload(execution_plan)
    end

    # { "id"=>"10abd90e-bcb7-4568-a68c-679701a2b2f7",
    #   "type"=>"ForemanTasks::Task::DynflowTask",
    #   "label"=>"Actions::RemoteExecution::RunHostJob",
    #   "started_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "ended_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "state"=>"stopped",
    #   "result"=>"error",
    #   "external_id"=>"66e2781a-379f-430b-8a2b-31a5035ec026",
    #   "parent_task_id"=>"21a4539a-76a1-404c-b98b-0ee86b169e74",
    #   "start_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "start_before"=>nil,
    #   "action"=>"Remote action: Run ls -la / on allen-touhy.logan-minteer.rene-henandez.example.net",
    #   "user_id"=>4,
    #   "state_updated_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00 }
    def event_payload(_execution_plan)
      task.attributes
    end
  end
end
