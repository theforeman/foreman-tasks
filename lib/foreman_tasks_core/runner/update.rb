require 'foreman_tasks_core/continuous_output'

module ForemanTasksCore
  module Runner
    # Runner::Update represents chunk of data produced by runner that
    # can be consumed by other components, such as RunnerAction
    class Update
      attr_reader :continuous_output, :exit_status
      def initialize(continuous_output, exit_status)
        @continuous_output = continuous_output
        @exit_status = exit_status
      end

      def self.encode_exception(context, exception, fatal = true)
        continuous_output = ::ForemanTasksCore::ContinuousOutput.new
        continuous_output.add_exception(context, exception)
        new(continuous_output, fatal ? 'EXCEPTION' : nil)
      end
    end

    class ExternalEvent
      attr_reader :data
      def initialize(data = {})
        @data = data
      end
    end
  end
end
