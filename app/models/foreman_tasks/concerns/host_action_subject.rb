module ForemanTasks
  module Concerns
    module HostActionSubject
      extend ActiveSupport::Concern
      include ForemanTasks::Concerns::ActionSubject

      def action_input_key
        'host'
      end

      def available_locks
        [:read, :write, :import_facts]
      end
    end
  end
end
