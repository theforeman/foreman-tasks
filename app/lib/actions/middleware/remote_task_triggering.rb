module Actions
  module Middleware
    class RemoteTaskTriggering < ::Dynflow::Middleware
      BATCH_SIZE = 1000

      # If the event could result into sub tasks being planned, check if there are any RemoteTasks
      # to trigger after the event is processed
      def run(event = nil)
        pass event
      ensure
        trigger_remote_tasks if event.nil? || event.is_a?(Dynflow::Action::WithBulkSubPlans::PlanNextBatch)
      end

      def trigger_remote_tasks
        # Find the tasks in batches, order them by proxy_url so we get all tasks
        # to a certain proxy "close to each other"
        remote_tasks.pending.order(:proxy_url, :id).find_in_batches(:batch_size => BATCH_SIZE) do |batch|
          # Group the tasks by operation, in theory there should be only one operation
          batch.group_by(&:operation).each do |operation, group|
            ForemanTasks::RemoteTask.batch_trigger(operation, group)
          end
        end
      end

      def remote_tasks
        action.task.remote_sub_tasks
      end
    end
  end
end
