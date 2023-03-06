require 'msgpack'

module Actions
  module Middleware
    class CheckActionStorageSize < ::Dynflow::Middleware
      SIZE_THRESHOLD = 1024

      def delay(*args)
        check_storage_size(*args)
      end

      def plan(*args)
        check_storage_size(*args)
      end

      def run(*args)
        check_storage_size(*args)
      end

      def finalize(*args)
        check_storage_size(*args)
      end

      private

      def check_storage_size(*args)
        pass(*args).tap do
          data = action.to_hash
          [:input, :output].each do |key|
            size = MessagePack.pack(data[key]).size
            if size > SIZE_THRESHOLD
              action.action_logger.warn("Plan #{action.execution_plan_id}, action #{action.id}: #{key} of size #{size} exceeded size threshold of #{SIZE_THRESHOLD}")
            end
          end
        end
      end
    end
  end
end
