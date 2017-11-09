module Actions
  module Middleware
    class WatchDelegatedProxySubTasks < ::Dynflow::Middleware

      class CheckOnProxyActions; end
      POLL_INTERVAL = 30

      def run(event = nil)
        if event.nil?
          set_clock
        elsif event == CheckOnProxyActions
          poll_proxy_tasks
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

      def poll_proxy_tasks
        results = delegated_actions_by_proxy.map { |(url, actions)| poll_proxy_actions(url, actions) }.flatten

        missing, present = results.partition { |result| result[:result].nil? }
        if missing.any?
          event = ::Actions::ProxyAction::ProxyActionMissing.new
          notify(event, missing.map { |action| action[:action] })
        end

        stopped = present.select { |action| %w(stopped paused).include? action[:result]['state'] }
        if stopped.any?
          event = ::Actions::ProxyAction::ProxyActionStopped.new
          notify(event, stopped.map { |a| a[:action] })
        end
      end

      def notify(event, actions)
        actions.each do |action|
          action.world.event action.execution_plan_id,
                             action.run_step_id,
                             event
        end
      end

      def delegated_actions
        action.sub_plans('state' => %w(running))
          .map(&:entry_action)
          .select { |action| action.input.key? :delegated_action_id }
          .map do |action|
            action.planned_actions.find { |planned| planned.id == action.input[:delegated_action_id] }
          end
      end

      def delegated_actions_by_proxy
        delegated_actions.select { |action| action.output.key?(:proxy_task_id) }
                         .group_by { |action| action.input[:proxy_url] }
      end

      def poll_proxy_actions(url, actions)
        proxy = ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => url)
        results = proxy.task_states(actions.map { |action| action.output[:proxy_task_id] })
        actions.map do |action|
          { :action => action, :result => results[action.output[:proxy_task_id]] }
        end
      end
    end
  end
end
