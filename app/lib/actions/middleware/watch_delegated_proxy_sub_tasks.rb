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
        action.world.clock.ping action.send(:suspended_action),
                                POLL_INTERVAL,
                                CheckOnProxyActions
      end

      def check_triggered
        # Sort by proxy_url so there are less requests per proxy
        source = remote_tasks.triggered.order(:proxy_url, :id)
        source.find_in_batches(:batch_size => BATCH_SIZE) do |batch|
          tasks = batch.group_by(&:proxy_url)
                       .map { |(url, tasks)| poll_proxy_tasks(url, tasks) }
                       .flatten
          process_task_results tasks
        end
      end

      def process_task_results(tasks)
        missing, present = tasks.partition { |task| task.result.nil? }
        notify ::Actions::ProxyAction::ProxyActionMissing.new, missing if missing.any?

        stopped = present.select { |task| %w[stopped paused].include? task.result['state'] }
        notify ::Actions::ProxyAction::ProxyActionStopped.new, stopped if stopped.any?
      end

      def notify(event, tasks)
        tasks.each do |task|
          action.world.event task.execution_plan_id,
                             task.step_id,
                             event
        end
      end

      def remote_tasks
        action.task.remote_sub_tasks
      end

      def poll_proxy_tasks(url, tasks)
        proxy = ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => url)
        results = proxy.task_states(tasks.map(&:remote_task_id))
        tasks.map do |task|
          task.result = results[task.remote_task_id]
          task
        end
      rescue => e
        # We could not reach the remote task, we assume it's gone
        action.action_logger.warn(_('Failed to check on tasks on proxy at %{url}: %{exception}') % { :url => url, :exception => e.message })
        tasks
      end
    end
  end
end
