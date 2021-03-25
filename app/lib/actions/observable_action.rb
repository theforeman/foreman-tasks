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

      trigger_hook "#{self.class.event_name_base}_#{self.class.event_name_suffix(hook)}",
                   payload: event_payload(execution_plan)
    end

    def event_payload(_execution_plan)
      { object: self }
    end

    extend ApipieDSL::Module

    apipie :class, "An common ancestor action for observable actions" do
      name 'Actions::ObservableAction'
      refs 'Actions::ObservableAction'
      sections only: %w[all webhooks]
      property :task, object_of: 'Task', desc: 'Returns the task to which this action belongs'
    end
    class Jail < Safemode::Jail
      allow :task
    end
  end
end
