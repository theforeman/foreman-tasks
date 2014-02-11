module ForemanTasks
  module Concerns
    module ActionSubject

      extend ActiveSupport::Concern

      included do
        before_create :before_plan_action
        before_update :before_plan_action
        before_destroy :before_plan_action

        after_create :plan_create_action
        after_update :plan_update_action
        after_destroy :plan_destroy_action
        after_commit :execute_planned_action
      end

      module ClassMethods
        def available_locks
          [:read, :write]
        end
      end

      def action_input_key
        self.class.name.underscore[/\w*\Z/]
      end

      def to_action_input
        if self.new_record?
          raise "The resource needs to be saved first"
        end
        { id: id, name: name }.tap do |hash|
          hash.update(label: label) if self.respond_to? :label
        end
      end

      # @api override to return the objects that relate to this one, usually parent
      # objects, e.g. repository would return product it belongs to, product would return
      # provider etc.
      #
      # It's used to link a task running on top of this resource to it's related objects,
      # so that is't possible to see all the sync tasks for a product etc.
      def related_resources
      end

      # Recursively searches for related resources of this one, avoiding cycles
      def related_resources_recursive(result = [])
        Array(related_resources).each do |related_resource|
          unless result.include?(related_resource)
            result << related_resource
            if related_resource.respond_to?(:related_resources_recursive)
              related_resource.related_resources_recursive(result)
            end
          end
        end
        return result
      end

      # dynflow actions are async by default
      def before_plan_action
        @dynflow_sync_action = false
        return true
      end

      # to make the triggered action synchronous
      def sync_action!
        @dynflow_sync_action = true
      end

      def create_action
      end

      def update_action
      end

      def destroy_action
      end

      def plan_create_action
        plan_action(create_action, self) if create_action
        return true
      end

      def plan_update_action
        plan_action(update_action, self) if update_action
        return true
      end

      def plan_destroy_action
        plan_action(destroy_action, self) if destroy_action
        return true
      end

      # Perform planning phase of the action tied with the model event.
      # We do it separately from the execution phase, because the transaction
      # of planning phase is expected to be commited when execution occurs. Also
      # we want to be able to rollback the whole db operation when planning fails.
      def plan_action(action_class, *args)
        @execution_plan = ::ForemanTasks.dynflow.world.plan(action_class, *args)
        planned         = @execution_plan.state == :planned
        unless planned
          errors = @execution_plan.steps.values.map(&:error).compact
          # we raise error so that the whole transaction is rollbacked
          raise errors.map(&:message).join('; ')
        end
      end

      # Execute the prepared execution plan after the db transaction was commited
      def execute_planned_action
        if @execution_plan
          run = ::ForemanTasks.dynflow.world.execute(@execution_plan.id)
          run.finished.wait if @dynflow_sync_action
        end
        return true
      end
    end
  end
end
