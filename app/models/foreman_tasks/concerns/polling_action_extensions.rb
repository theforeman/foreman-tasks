module ForemanTasks
  module Concerns
    module PollingActionExtensions
      def poll_intervals
        super + Setting[:foreman_tasks_extra_polling_intervals]
      end
    end
  end
end
