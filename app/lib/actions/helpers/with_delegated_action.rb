module Actions
  module Helpers
    module WithDelegatedAction
      include ::Actions::Helpers::WithContinuousOutput

      def plan_delegated_action(proxy, options, proxy_action_class: ::Actions::ProxyAction)
        case proxy
        when ::SmartProxy
          delegated_action = plan_action(proxy_action_class, proxy, options)
        when :not_available
          raise Foreman::Exception, _('All proxies with the required feature are unavailable at the moment')
        else
          raise Foreman::Exception, _('No proxy defined for execution')
        end

        input[:delegated_action_id] = delegated_action.id
        delegated_action
      end

      def humanized_output
        delegated_output
      end

      def continuous_output_providers
        super.tap do |ret|
          ret << delegated_action if delegated_action.respond_to?(:fill_continuous_output)
        end
      end

      def delegated_output
        return @delegated_output if @delegated_output
        action = delegated_action
        @delegated_output = case action
                            when NilClass
                              {}
                            when ::Actions::ProxyAction
                              action.proxy_output(true)
                            end
      end

      def delegated_action
        # TODO: make it easier in dynflow to load action data
        delegated_step = task.execution_plan.steps.values.reverse.find do |step|
          step.action_id == input[:delegated_action_id]
        end
        return unless delegated_step
        world.persistence.load_action(delegated_step)
      end
    end
  end
end
