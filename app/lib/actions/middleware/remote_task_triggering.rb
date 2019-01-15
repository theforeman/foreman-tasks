module Actions
  module Middleware
    class RemoteTaskTriggering < ::Dynflow::Middleware
      # If the event could result into sub tasks being planned, check if there are any RemoteTasks
      # to trigger after the event is processed
      #
      # The ProxyAction needs to be planned with `:use_batch_triggering => true` to activate the feature
      def run(event = nil)
        pass event
      ensure
        trigger_remote_tasks if event.nil? || event.is_a?(Dynflow::Action::WithBulkSubPlans::PlanNextBatch)
      end

      def trigger_remote_tasks
        # Find the tasks in batches, order them by proxy_url so we get all tasks
        # to a certain proxy "close to each other"
        remote_tasks.pending.order(:proxy_url, :id).find_in_batches(:batch_size => batch_size) do |batch|
          # Group the tasks by operation, in theory there should be only one operation
          batch.group_by(&:operation).each do |operation, group|
            ForemanTasks::RemoteTask.batch_trigger(operation, group)
          end
        end
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
