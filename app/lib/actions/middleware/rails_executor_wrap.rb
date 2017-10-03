module Actions
  module Middleware
    class RailsExecutorWrap < Dynflow::Middleware
      def run(*args)
        Rails.application.executor.wrap do
          pass(*args)
        end
      end

      def finalize
        Rails.application.executor.wrap do
          pass
        end
      end
    end
  end
end
