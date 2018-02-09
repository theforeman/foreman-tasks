module Actions
  module Middleware
    class WatchDelegatedProxySubTasks < ::Dynflow::Middleware
      class CheckOnProxyActions; end
      POLL_INTERVAL = 10

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
        tasks = remote_tasks.triggered.group_by(&:proxy_url)
                      .map { |(url, tasks)| poll_proxy_tasks(url, tasks) }.flatten

        missing, present = tasks.partition { |task| task.result.nil? }
        if missing.any?
          event = ::Actions::ProxyAction::ProxyActionMissing.new
          notify event, missing
        end

        stopped = present.select { |task| %w[stopped paused].include? task.result['state'] }
        if stopped.any?
          event = ::Actions::ProxyAction::ProxyActionStopped.new
          notify event, stopped
        end
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
      end
    end
  end
end
