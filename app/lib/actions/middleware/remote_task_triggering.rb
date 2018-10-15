module Actions
  module Middleware
    class RemoteTaskTriggering < ::Dynflow::Middleware
      def run(event = nil)
        pass event
      ensure
        trigger_remote_tasks if event.nil? || event.is_a?(Dynflow::Action::WithBulkSubPlans::PlanNextBatch)
      end

      def trigger_remote_tasks
        remote_tasks.pending.order(:proxy_url, :id).find_in_batches(:batch_size => BATCH_SIZE) do |batch|
          ForemanTasks::RemoteTask.batch_trigger(batch, 'ForemanTasksCore::Runner::ParentAction')
        end
      end

      def remote_tasks
        action.task.remote_sub_tasks
      end
    end
  end
end

