module Actions
  module Middleware
    # In development with Rails auto-reloading and using `sync_task` method,
    # it could lead to dead-locking due to the Rails main thread locking the
    # the class loader.
    #
    # This middleware marks the part of the code that can
    # use the auto-loader so that Rails know they should avoid the locking there.
    # See https://github.com/ruby-concurrency/concurrent-ruby/issues/585#issuecomment-256131537
    # for more details.
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
