module ForemanTasks
  module Concerns
    module Parameters
      module RecurringLogic
        extend ActiveSupport::Concern

        class_methods do
          def recurring_logic_params_filter
            Foreman::ParameterFilter.new(::ForemanTasks::RecurringLogic).tap do |filter|
              filter.permit(:enabled)
            end
          end
        end

        def recurring_logic_params
          self.class.recurring_logic_params_filter.filter_params(params, parameter_filter_context, :recurring_logic)
        end
      end
    end
  end
end
