module Actions
  module Middleware
    class RemoteTaskTriggering < ::Dynflow::Middleware
      BATCH_SIZE = 1000

      def run(event = nil)
        pass event
      ensure
        trigger_remote_tasks if event.nil? || event.is_a?(Dynflow::Action::WithBulkSubPlans::PlanNextBatch)
      end

      def trigger_remote_tasks
        remote_tasks.pending.order(:proxy_url, :id).find_in_batches(:batch_size => BATCH_SIZE) do |batch|
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
