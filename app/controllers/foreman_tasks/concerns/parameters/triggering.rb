module ForemanTasks
  module Concerns
    module Parameters
      module Triggering
        extend ActiveSupport::Concern
        include Foreman::Controller::Parameters::KeepParam

        class_methods do
          def triggering_params_filter
            Foreman::ParameterFilter.new(::ForemanTasks::Triggering).tap do |filter|
              filter.permit_by_context(:mode, :start_at, :start_before,
                                       *::ForemanTasks::Triggering::PARAMS,
                                       :nested => true)
            end
          end
        end

        def triggering_params
          keep_param(params, :triggering, :days_of_week, :time, :end_time) do
            self.class.triggering_params_filter.filter_params(params, parameter_filter_context, :triggering)
          end
        end
      end
    end
  end
end
