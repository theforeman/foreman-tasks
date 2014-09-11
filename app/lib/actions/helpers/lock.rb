module Actions
  module Helpers
    module Lock
      # @see Lock.exclusive!
      def exclusive_lock!(resource)
        phase! Dynflow::Action::Plan
        ::ForemanTasks::Lock.exclusive!(resource, task.id)
      end

      # @see Lock.lock!
      def lock!(resource, *lock_names)
        phase! Dynflow::Action::Plan
        ::ForemanTasks::Lock.lock!(resource, task.id, *lock_names.flatten)
      end

      # @see Lock.link!
      def link!(resource)
        phase! Dynflow::Action::Plan
        ::ForemanTasks::Lock.link!(resource, task.id)
      end
    end
  end
end
