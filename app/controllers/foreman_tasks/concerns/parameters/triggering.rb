module ForemanTasks
  module Concerns
    module Parameters
      module Triggering
        extend ActiveSupport::Concern

        class_methods do
          def triggering_params_filter
            Foreman::ParameterFilter.new(::ForemanTasks::Triggering).tap do |filter|
              filter.permit_by_context(
                [
                  :mode,
                  :start_at,
                  :start_before,
                  *::ForemanTasks::Triggering::PARAMS,
                  :days_of_week => {},
                  :time => {},
                  :end_time => {}
                ],
                :nested => true
              )
            end
          end
        end

        def triggering_params
          self.class.triggering_params_filter.filter_params(params, parameter_filter_context, :triggering)
        end
      end
    end
  end
end
