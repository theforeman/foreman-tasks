module Actions
  module Helpers
    module WithDelegatedAction
      include ::Actions::Helpers::WithContinuousOutput

      def plan_delegated_action(proxy, klass, options)
        case proxy
        when :not_defined
          if klass.is_a?(String)
            raise Foreman::Exception, _('No proxy defined for execution')
          else
            delegated_action = plan_action(klass, options)
          end
        when :not_available
          raise Foreman::Exception, _('All proxies with the required feature are unavailable at the moment')
        when ::SmartProxy
          delegated_action = plan_action(::Actions::ProxyAction, proxy, klass, options)
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
                            else
                              action.output
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
