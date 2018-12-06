module Actions
  module Helpers
    module Lock
      # @see Lock.exclusive!
      def exclusive_lock!(resource)
        phase! Dynflow::Action::Plan
        parent_lock = ::ForemanTasks::Lock.for_resource(resource).where(:task_id => task.self_and_parents.map(&:id)).first
        if parent_lock
          ::ForemanTasks::Link.link!(resource, task.id)
          parent_lock
        else
          ::ForemanTasks::Lock.exclusive!(resource, task.id)
        end
      end

      # @see Lock.lock!
      def lock!(resource, *_lock_names)
        exclusive_lock!(resource)
      end

      # @see Lock.link!
      def link!(resource)
        phase! Dynflow::Action::Plan
        ::ForemanTasks::Link.link!(resource, task.id)
      end
    end
  end
end
