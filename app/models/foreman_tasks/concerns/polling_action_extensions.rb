module ForemanTasks
  module Concerns
    module PollingActionExtensions
      def poll_intervals
        if (setting = Setting[:foreman_tasks_polling_intervals]).any?
          setting
        else
          super + [32, 64, 128, 256, 512, 1024]
        end
      end
    end
  end
end
