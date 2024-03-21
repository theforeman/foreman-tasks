module Actions
  module Middleware
    class WatchDelegatedProxySubTasks < ::Dynflow::Middleware
      class CheckOnProxyActions; end
      # Poll the proxy every 10 minutes
      POLL_INTERVAL = 600
      BATCH_SIZE = 1000

      def run(event = nil)
        if event.nil?
          set_clock
        elsif event == CheckOnProxyActions
          check_triggered
          set_clock
          action.send(:suspend)
        end
        pass event
      end

      private

      def set_clock
        action.plan_event(CheckOnProxyActions, POLL_INTERVAL, optional: true)
      end

      def check_triggered
        in_remote_task_batches(remote_tasks.triggered) do |batch|
          batch.group_by(&:proxy_url).each do |(url, tasks)|
            results = poll_proxy_tasks(url, tasks)
            process_task_results tasks, results
          end
        end
      end

      def process_task_results(tasks, results)
        possibly_missing, present = tasks.partition { |task| !results.key?(task.remote_task_id) }
        missing = possibly_missing.select do |task|
          # Really missing are tasks which are missing and:
          # don't have a remote parent
          # had a remote parent but the proxy doesn't have the remote parent anymore
          # has a remote parent, proxy has the remote parent but it is stopped or paused
          task.parent_task_id.nil? ||
            !results.key?(task.parent_task_id) ||
            %(stopped paused).include?(results[task.parent_task_id]['state'])
        end
        notify ::Actions::ProxyAction::ProxyActionMissing.new, missing if missing.any?

        stopped = present.select { |task| %w[stopped paused].include? results.dig(task.remote_task_id, 'state') }
        notify ::Actions::ProxyAction::ProxyActionStoppedEvent[nil], stopped if stopped.any?
      end

      def notify(event, tasks)
        tasks.each do |task|
          action.plan_event(event, execution_plan_id: task.execution_plan_id, step_id: task.step_id, optional: true)
        end
      end

      def remote_tasks
        action.task.remote_sub_tasks
      end

      def poll_proxy_tasks(url, tasks)
        proxy = ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => url)
        # Get statuses of tasks and their optional parent tasks
        ids = (tasks.map(&:remote_task_id) + tasks.map(&:parent_task_id)).uniq
        proxy.task_states(ids)
      rescue => e
        # We could not reach the remote task, we'll try again next time
        action.action_logger.warn(_('Failed to check on tasks on proxy at %{url}: %{exception}') % { :url => url, :exception => e.message })
        {}
      end

      def in_remote_task_batches(scope)
        # Sort by proxy_url so there are less requests per proxy
        scope.order(:proxy_url, :id).find_in_batches(:batch_size => BATCH_SIZE) do |batch|
          yield batch
        end
      end
    end
  end
end
