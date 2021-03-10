module Actions
  module Middleware
    class ProxyBatchTriggering < ::Dynflow::Middleware

      RETRY_TRIGGER = Class.new

      # If the event could result into sub tasks being planned, check if there are any RemoteTasks
      # to trigger after the event is processed
      #
      # The ProxyAction needs to be planned with `:use_batch_triggering => true` to activate the feature
      def run(event = nil)
        pass event unless event.is_a? RETRY_TRIGGER
      ensure
        if event.nil? || event.is_a?(Dynflow::Action::WithBulkSubPlans::PlanNextBatch) || event.is_a?(RETRY_TRIGGER)
          trigger_remote_tasks
        end
        action.send(:suspend) if event.is_a?(RETRY_TRIGGER)
      end

      def trigger_remote_tasks
        # Find the tasks in batches, order them by proxy_url so we get all tasks
        # to a certain proxy "close to each other"
        should_retry = false
        seen = []
        remote_tasks.pending.where.not(:id => seen).order(:proxy_url, :id).find_in_batches(:batch_size => batch_size) do |batch|
          # Group the tasks by operation, in theory there should be only one operation
          batch.group_by(&:operation).each do |operation, group|
            _, failed = ForemanTasks::RemoteTask.batch_trigger(operation, group)
            seen.concat(failed.map(&:id))
            should_retry |= failed.any?
          end
        end
        if should_retry && !action.send(:can_spawn_next_batch?) # TODO
          action.plan_event(RETRY_TRIGGER.new, retry_interval)
        end
      end

      def retry_interval
        60
      end

      def remote_tasks
        action.task.remote_sub_tasks
      end

      private

      def batch_size
        Setting['foreman_tasks_proxy_batch_size']
      end
    end
  end
end
