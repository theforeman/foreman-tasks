module ForemanTasks
  module Concerns
    module PollingActionExtensions
      def poll_intervals
        multiplier = Setting[:foreman_tasks_polling_multiplier] || 1

        # Prevent the intervals from going below 0.5 seconds
        super.map { |interval| [interval * multiplier, 0.5].max }
      end
    end
  end
end
