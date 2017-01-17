module ForemanTasksCore
  module Runner
    # Runner is an object that is able to initiate some action and
    # provide update data on refresh call.
    class Base
      attr_reader :id
      attr_accessor :logger

      def initialize(*_args)
        @id = SecureRandom.uuid
        @continuous_output = ::ForemanTasksCore::ContinuousOutput.new
      end

      def logger
        @logger ||= Logger.new(STDERR)
      end

      def run_refresh
        logger.debug('refreshing runner')
        refresh
        new_data = @continuous_output
        @continuous_output = ForemanTasksCore::ContinuousOutput.new
        if !new_data.empty? || @exit_status
          return Runner::Update.new(new_data, @exit_status)
        end
      end

      def start
        raise NotImplementedError
      end

      def refresh
        raise NotImplementedError
      end

      def kill
        # Override when you can kill the runner in the middle
      end

      def close
        # if cleanup is needed
      end

      def publish_data(data, type)
        @continuous_output.add_output(data, type)
      end

      def publish_exception(context, exception, fatal = true)
        logger.error("#{context} - #{exception.class} #{exception.message}:\n" + \
                     exception.backtrace.join("\n"))
        @continuous_output.add_exception(context, exception)
        publish_exit_status('EXCEPTION') if fatal
      end

      def publish_exit_status(status)
        @exit_status = status
      end
    end
  end
end
