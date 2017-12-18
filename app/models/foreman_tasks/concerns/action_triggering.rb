module ForemanTasks
  module Concerns
    module ActionTriggering
      extend ActiveSupport::Concern

      included do
        raise "Use 'prepend' instead of 'include' for ForemanTasks::Concerns::ActionTriggering"
      end

      def self.prepended(base)
        base.after_create :plan_hook_action
        base.after_update :plan_hook_action
        base.after_destroy :plan_hook_action
      end

      # These three *_action methods are called before the save/destroy actually occurs
      # @override
      def create_action; end

      # @override
      def update_action; end

      # @override
      def destroy_action; end

      def save(*args)
        dynflow_task_wrap(:save) { super(*args) }
      end

      def save!(*args)
        dynflow_task_wrap(:save) { super(*args) }
      end

      def destroy
        dynflow_task_wrap(:destroy) { super }
      end

      def update_attributes(*args)
        dynflow_task_wrap(:save) { super(*args) }
      end

      def update_attributes!(*args)
        dynflow_task_wrap(:save) { super(*args) }
      end

      # this can be used when HostActionSubject is used for orchestration but you want to avoid
      # triggering more tasks by ActiveRecord callbacks within run/finalize phase of your task
      # e.g. host.disable_dynflow_hooks { |h| h.save }
      def disable_dynflow_hooks
        @_disable_dynflow_hooks = true

        if block_given?
          begin
            yield(self)
          ensure
            @_disable_dynflow_hooks = false
          end
        end
      end

      def enable_dynflow_hooks
        @_disable_dynflow_hooks = false
      end

      protected

      def sync_action_flag_reset!
        @dynflow_sync_action = false
      end

      # to make the triggered action synchronous
      def sync_action!
        @dynflow_sync_action = true
      end

      def plan_hook_action
        plan_action(@_dynflow_hook_action, self) if @_dynflow_hook_action
        true
      end

      # Perform planning phase of the action tied with the model event.
      # We do it separately from the execution phase, because the transaction
      # of planning phase is expected to be commited when execution occurs. Also
      # we want to be able to rollback the whole db operation when planning fails.
      def plan_action(action_class, *args)
        return if ForemanTasks.dynflow.config.disable_active_record_actions
        @execution_plan = ::ForemanTasks.dynflow.world.plan(action_class, *args)
        raise @execution_plan.errors.first if @execution_plan.error?
      end

      # Makes sure the execution plan is executed AFTER the transaction is commited.
      # We can't user after_commit filters because they don't allow to raise
      # exceptions in there, so we would not be able to report that something
      # went wrong when running a sync_task.:
      #
      #   http://guides.rubyonrails.org/v3.2.14/active_record_validations_callbacks.html#transaction-callbacks
      #
      # That's why we need to override save and destroy methods instead.
      # Another reason why one should avoid callbacks for orchestration.
      #
      # Also, it makes sure the save is not run inside other transaction because
      # we would start the execution phase inside this transaction which would lead
      # to unexpected results.
      def dynflow_task_wrap(method)
        if ForemanTasks.dynflow.config.disable_active_record_actions ||
           @_disable_dynflow_hooks ||
           @_dynflow_task_wrapped
          return yield
        end
        @_dynflow_task_wrapped = true

        @_dynflow_hook_action = case method
                                when :save
                                  new_record? ? create_action : update_action
                                when :destroy
                                  destroy_action
                                else
                                  raise 'unexpected method'
                                end
        ensure_not_in_transaction! if @_dynflow_hook_action
        yield.tap do |result|
          execute_planned_action if result
          sync_action_flag_reset!
        end
      ensure
        @_dynflow_hook_action = nil
        @_dynflow_task_wrapped = false
      end

      # we don't want to start executing the task calling to external services
      # when inside some other transaction. Might lead to unexpected results
      def ensure_not_in_transaction!
        # we don't care about transactions when using InThreadWorld
        if defined?(::Dynflow::Testing::InThreadWorld) &&
           ForemanTasks.dynflow.world.is_a?(::Dynflow::Testing::InThreadWorld)
          return
        end
        if self.class.connection.open_transactions > 0
          raise 'Executing dynflow action inside a transaction is not a good idea'
        end
      end

      # Execute the prepared execution plan after the db transaction was commited
      def execute_planned_action
        if @execution_plan
          run = ::ForemanTasks.dynflow.world.execute(@execution_plan.id)
          if @dynflow_sync_action
            run.wait
            if run.value.error?
              task = ForemanTasks::Task::DynflowTask.where(:external_id => @execution_plan.id).first!
              raise ForemanTasks::TaskError, task
            end
          end
        end
        return true
      ensure
        # to not execute the same execution plan twice in a row
        @execution_plan = nil
      end
    end
  end
end
